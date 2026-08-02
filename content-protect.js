/*
 * content-protect.js
 * حماية موحّدة للنسخ والتحديد لكامل بوابة الاعتماد المدرسي والتميز - مدارس دار الفرسان
 * الوضع الافتراضي: مقيّد (لا نسخ ولا تحديد). يُفتح المحتوى لجلسة المتصفح الحالية فقط
 * بعد إدخال بيانات صحيحة من نفس ملف access.txt المستخدم في صفحة تسجيل الدخول.
 * يعود المحتوى تلقائياً للحالة المقيّدة بمجرد الضغط على زر "تسجيل الخروج" أو إغلاق الجلسة.
 */
(function () {
    'use strict';

    const SESSION_KEY = 'df_content_unlocked';
    const SESSION_USER_KEY = 'df_content_unlocked_user';

    // ===== 1. حقن الأنماط (القفل الافتراضي على كامل الصفحة) =====
    const style = document.createElement('style');
    style.id = 'df-protect-style';
    style.textContent = `
        body.df-locked, body.df-locked * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }
        body.df-locked img { -webkit-user-drag: none; pointer-events: auto; }

        #df-lock-btn {
            position: fixed; top: 14px; left: 14px; z-index: 9999;
            width: 42px; height: 42px; border-radius: 9999px;
            background: linear-gradient(135deg, #003d3d, #002424);
            border: 1px solid rgba(194,155,56,0.5);
            color: #c29b38; font-size: 16px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0,.25);
            cursor: pointer; transition: transform .15s ease;
        }
        #df-lock-btn:hover { transform: scale(1.08); }

        #df-logout-btn {
            position: fixed; top: 14px; left: 14px; z-index: 9999;
            display: none; align-items: center; gap: 6px;
            background: linear-gradient(135deg, #7f1d1d, #450a0a);
            border: 1px solid rgba(255,255,255,0.15);
            color: #fff; font-size: 11px; font-weight: 700;
            padding: 10px 14px; border-radius: 9999px;
            box-shadow: 0 4px 14px rgba(0,0,0,.25);
            cursor: pointer; font-family: 'Cairo', sans-serif;
        }
        #df-logout-btn:hover { filter: brightness(1.1); }

        #df-lock-overlay {
            position: fixed; inset: 0; z-index: 10000;
            background: rgba(0,10,10,0.72);
            display: none; align-items: center; justify-content: center;
            padding: 16px; font-family: 'Cairo', sans-serif;
        }
        #df-lock-overlay.df-show { display: flex; }
        #df-lock-modal {
            background: #fff; border-radius: 16px; max-width: 420px; width: 100%;
            padding: 26px; box-shadow: 0 20px 60px rgba(0,0,0,.4);
            direction: rtl; text-align: right;
        }
        #df-lock-modal .df-icon-wrap {
            width: 56px; height: 56px; border-radius: 9999px;
            background: linear-gradient(135deg, #c29b38, #003d3d);
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 22px; margin-bottom: 14px;
        }
        #df-lock-modal h3 { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
        #df-lock-modal p.df-notice {
            font-size: 11px; line-height: 1.9; color: #78716c;
            background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px;
            padding: 10px 12px; margin-bottom: 16px;
        }
        #df-lock-modal input {
            width: 100%; box-sizing: border-box; font-size: 13px;
            padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px;
            margin-bottom: 10px; font-family: 'Cairo', sans-serif;
        }
        #df-lock-modal input:focus { outline: none; border-color: #006666; }
        #df-lock-error {
            display: none; font-size: 11px; color: #b91c1c;
            background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
            padding: 8px 10px; margin-bottom: 10px;
        }
        #df-lock-actions { display: flex; gap: 8px; margin-top: 6px; }
        #df-lock-submit {
            flex: 1; background: #006666; color: #fff; border: none;
            padding: 11px; border-radius: 10px; font-weight: 800; font-size: 12px;
            cursor: pointer; font-family: 'Cairo', sans-serif;
        }
        #df-lock-submit:hover { background: #005252; }
        #df-lock-cancel {
            background: #f1f5f9; color: #475569; border: none;
            padding: 11px 16px; border-radius: 10px; font-weight: 700; font-size: 12px;
            cursor: pointer; font-family: 'Cairo', sans-serif;
        }
        #df-lock-cancel:hover { background: #e2e8f0; }
    `;
    document.head.appendChild(style);

    // ===== 2. حقن العناصر (زر القفل، زر الخروج، نافذة تسجيل الدخول) =====
    function buildDOM() {
        const lockBtn = document.createElement('button');
        lockBtn.id = 'df-lock-btn';
        lockBtn.type = 'button';
        lockBtn.title = 'المحتوى محمي — اضغط لإدخال بيانات الدخول';
        lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i>';
        document.body.appendChild(lockBtn);

        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'df-logout-btn';
        logoutBtn.type = 'button';
        logoutBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i><span>تسجيل خروج (إعادة تقييد المحتوى)</span>';
        document.body.appendChild(logoutBtn);

        const overlay = document.createElement('div');
        overlay.id = 'df-lock-overlay';
        overlay.innerHTML = `
            <div id="df-lock-modal">
                <div class="df-icon-wrap"><i class="fa-solid fa-shield-halved"></i></div>
                <h3>هذا المحتوى محمي</h3>
                <p class="df-notice">
                    هذا المحتوى محمي بموجب قوانين حماية البيانات والمحتوى، وبموجب قانون حماية الملكية الفكرية
                    لمدارس دار الفرسان الأهلية 2026 - 2027. يرجى إدخال بيانات الدخول المعتمدة لإتاحة التحديد والنسخ لجلستكم الحالية فقط.
                </p>
                <div id="df-lock-error"></div>
                <form id="df-lock-form">
                    <input type="text" id="df-lock-username" placeholder="اسم المستخدم / البريد الإلكتروني" autocomplete="username" required>
                    <input type="password" id="df-lock-password" placeholder="كلمة المرور" autocomplete="current-password" required>
                    <div id="df-lock-actions">
                        <button type="submit" id="df-lock-submit"><i class="fa-solid fa-unlock"></i>&nbsp; إتاحة المحتوى</button>
                        <button type="button" id="df-lock-cancel">إلغاء</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        return { lockBtn, logoutBtn, overlay };
    }

    // ===== 3. تحميل ملف الصلاحيات access.txt (نفس آلية login.html) =====
    let VALID_USERS = [];
    let accessListLoaded = false;

    async function loadAccessList() {
        try {
            const res = await fetch('access.txt', { cache: 'no-store' });
            if (!res.ok) throw new Error('تعذر العثور على access.txt');
            const text = await res.text();
            VALID_USERS = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'))
                .map(line => {
                    const [username, password] = line.split(',').map(s => s.trim());
                    return { username, password };
                });
            accessListLoaded = true;
        } catch (err) {
            console.error('تعذر تحميل ملف الصلاحيات access.txt:', err);
            accessListLoaded = false;
        }
    }
    loadAccessList();

    // ===== 4. تطبيق حالتي القفل / الإتاحة =====
    function applyLocked() {
        document.body.classList.add('df-locked');
        const lockBtn = document.getElementById('df-lock-btn');
        const logoutBtn = document.getElementById('df-logout-btn');
        if (lockBtn) lockBtn.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

    function applyUnlocked() {
        document.body.classList.remove('df-locked');
        const lockBtn = document.getElementById('df-lock-btn');
        const logoutBtn = document.getElementById('df-logout-btn');
        if (lockBtn) lockBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'flex';
    }

    function isUnlocked() {
        return sessionStorage.getItem(SESSION_KEY) === 'true';
    }

    // منع أحداث النسخ/القص عندما يكون المحتوى مقفلاً (طبقة حماية إضافية غير الـCSS)
    document.addEventListener('copy', function (e) {
        if (!isUnlocked()) e.preventDefault();
    });
    document.addEventListener('cut', function (e) {
        if (!isUnlocked()) e.preventDefault();
    });
    document.addEventListener('contextmenu', function (e) {
        if (!isUnlocked()) e.preventDefault();
    });

    // ===== 5. الإقلاع =====
    document.addEventListener('DOMContentLoaded', function () {
        const { lockBtn, logoutBtn, overlay } = buildDOM();
        const form = document.getElementById('df-lock-form');
        const errorBox = document.getElementById('df-lock-error');
        const cancelBtn = document.getElementById('df-lock-cancel');

        if (isUnlocked()) {
            applyUnlocked();
        } else {
            applyLocked();
        }

        lockBtn.addEventListener('click', function () {
            errorBox.style.display = 'none';
            form.reset();
            overlay.classList.add('df-show');
            setTimeout(() => document.getElementById('df-lock-username').focus(), 50);
        });

        cancelBtn.addEventListener('click', function () {
            overlay.classList.remove('df-show');
        });

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.classList.remove('df-show');
        });

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('df-lock-username').value.trim();
            const password = document.getElementById('df-lock-password').value;

            if (!accessListLoaded) {
                await loadAccessList();
            }
            if (!accessListLoaded) {
                errorBox.textContent = 'تعذر الاتصال بملف الصلاحيات (access.txt). تأكد أن الموقع يعمل عبر خادم وليس كملف محلي.';
                errorBox.style.display = 'block';
                return;
            }

            const match = VALID_USERS.find(u => u.username === username && u.password === password);
            if (!match) {
                errorBox.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
                errorBox.style.display = 'block';
                return;
            }

            sessionStorage.setItem(SESSION_KEY, 'true');
            sessionStorage.setItem(SESSION_USER_KEY, username);
            overlay.classList.remove('df-show');
            applyUnlocked();
        });

        logoutBtn.addEventListener('click', function () {
            sessionStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_USER_KEY);
            applyLocked();
        });
    });
})();
