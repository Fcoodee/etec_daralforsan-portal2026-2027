function doGet(e) {
  var folderIds = [
    "1XMGjfZH3jh-WceZ8OCLEElyGHjpGY7yr",
    "16BfucKpeZ9k1G9fDCvsBa2SuXGTN48Py",
    "1TzzWUJqfWnC_20ooQR_46HLAdAxI1cZF",
    "1v2EpafmUkFa1c_C4ocvKd6tCj4hSblgX",
    "1CJONyhDeQxbmq5snr2utNHIAuWFhp_op",
    "10ghBE5Qhq8BCNtyr94TDeH14vWbpN26z",
    "1sXfzLYHbK99JmEJ4Ze4-MJ8zxM9O_qLs",
    "1vdvL9fGHk7km2_msYI9ITl-180C9m52_",
    "1Ct5I6lvxH8p2fy4zUMrvSV1XoWh49_61",
    "1MsB8mKQneMy_8Kx8nL826EjQpxJ__zwI",
    "1a-e_SeS5VduEd241EJxi3rLyr9hfllfS",
    "1m_6jxLhmifXCwvPRKUOez7USyazEFfeH",
    "1UxEOPsQC9Dpe_3WsF_X4it7mJoxHGdOf",
    "1ls09k13SRq2PnQQ78MPq5sVWOzPHb2d0",
    "16VPPWfZ8X2Yx6OCzpLcQngXvklerxto1",
    "1bQbGb-TN_kMPSpEcu2a6hVu8LXHQtPhJ",
    "1urrYndjc_1eQIf4m643aiNeTwmTS4Tbw",
    "1GPs7Y1sy0u8wyQ-BaejqTsNziBGyMft6",
    "1TJ7MrSQhZKmulkFlUDcrmze_LdsGaoCn",
    "161UDysSwkiWO-lO6lp0e2itpzxklhNup",
    "1ZhyM6SM0RXoLLfwaRV2wBt7NJPA-mQxu",
    "1-Mb78eC6fDv9sHoYUcWOtteX3xhCT8uk",
    "1xloUbyImzub7y0KYbVUmbi4b5cnMjNW9",
    "1NCJz7KSfZGHdWFH0HliI5inM1ywsXwwi",
    "1Of4_5NwBBId8AAUQPkzqFNB9Bvh-u-T6",
    "1H5H5yDTFrOdDJQeicfGuJRG49eP6mywt",
    "1hK8ziH9QsgxSfPNXH_oclrM946-jDeIZ",
    "1S0bJDrtMU7JXtT-gE10LWNhBERMO4Kl5",
    "1H6X-gclAr10SgfJNWAUHVlOoV443apz4",
    "1_h2xMuqizt4Cs7MnzpIdcVs_32QF2TvE",
    "1tBsiHImZqvDYhMvkf0L2HpUqs52PkSb7",
    "11K3c21-u9dtsibrcoimquSL65Kha_Nx8",
    "1lAGUEFAmey4VD97_kpnsgc7vxmnTzJIK",
    "112fyFsW7DEJIFLWLLRHjCc1tFEhYinyk",
    "199OQdGIda9b_d5_0eITCam5-Vu5ngFmP",
    "1rmQLmp9H4FhBkLHYyic6CdCLMo5vtGTk",
    "1ky0wE3KXYtYzJYVligOQd_YCxbn5L-zs",
    "1HM6CVwb0n6vjwjkTfpsXZXZWFSKniYnU",
    "1DpPXjuSnOws7LcinkoK_ep1nEApT0cye",
    "1rxZH-fzgMz8d7Yp6CT6qw_jcDmT1xTiq",
    "19sX_YIrpHGiTwdi6GXac9NEyM5VzTKmF",
    "1faWG_6pDNHd5LgH5mbexrjoJGqEd7t3V",
    "1hZtczf-565pUfhRJH9ay8Z-f_ug4EUq6",
    "1WH5As-GWwWu01wfSTPe9pzaJHEL4fpmM",
    "1EN-8GvXuK9fhhS5A6b3HoXYNc1o834bs",
    "1NVc9lvgkLFNWfyinozS1a6VDNFMgNgCw",
    "16ucuzXeiZpQtcA_Zw7Qssn1VnW7uiFH2",
    "1WQXBIFbm_iIyW03NCxTfEsqVTWNucsh1",
    "19Ve20WbkCvW1ljAzRuecm0ePhdTP0OIu",
    "18DNVMqbSsJUWl0SahzG9f3ouzUWuJdkr"
  ];

  var results = {};
  folderIds.forEach(function(id) {
    try {
      var folder = DriveApp.getFolderById(id);
      var files = folder.getFiles();
      var count = 0;
      while (files.hasNext()) { files.next(); count++; }
      results[id] = count;
    } catch (err) {
      results[id] = -1; // تعذر الوصول للمجلد (صلاحيات أو معرف غير صحيح)
    }
  });

  var output = ContentService.createTextOutput(JSON.stringify(results));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}