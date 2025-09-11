import { AzureReceiptSchema, type FieldValue } from "@/types/smart-receipt";
import { findCurrencyCode } from "@/utils/utils";

const data = {
  apiVersion: "2023-07-31",
  modelId: "prebuilt-receipt",
  content:
    "DX TORRE HORADADA\nMUSGRAVE ESPAÑA S.A.U.\nAVD. SANCHEZ LOZANO, S/N, PARC-C\nEL PILAR DE LA HORADADA\nCIF:A80837941 TLF:966746749\nFRA.SIMP:99273010058098\nFECHA: 15/05/2025 16:04:32\nCAJERO/A:VLADA\nCaja:01\nARTICULO\nIMPORTE\nCER.CORONA.35 CL\n27,00\n18,000 x\n1,50\n*** OFERTAS ***\nCOLA ZERO LATA\n9,96\nSERV.S.MIGUEL 33\n5,99\nTOTAL\n42,95\nDatáfono.\n42,95\nIMP.\nBASE\nCUOTA\n21,00\n35,50\n7,45",
  pages: [
    {
      pageNumber: 1,
      angle: -0.6468999981880188,
      width: 2273,
      height: 3500,
      unit: "pixel",
      spans: [
        {
          offset: 0,
          length: 372,
        },
      ],
      words: [
        {
          content: "DX",
          polygon: [
            {
              x: 152,
              y: 382,
            },
            {
              x: 255,
              y: 385,
            },
            {
              x: 250,
              y: 475,
            },
            {
              x: 147,
              y: 470,
            },
          ],
          span: {
            offset: 0,
            length: 2,
          },
          confidence: 0.975,
        },
        {
          content: "TORRE",
          polygon: [
            {
              x: 307,
              y: 387,
            },
            {
              x: 539,
              y: 395,
            },
            {
              x: 535,
              y: 485,
            },
            {
              x: 303,
              y: 477,
            },
          ],
          span: {
            offset: 3,
            length: 5,
          },
          confidence: 0.994,
        },
        {
          content: "HORADADA",
          polygon: [
            {
              x: 579,
              y: 396,
            },
            {
              x: 961,
              y: 411,
            },
            {
              x: 960,
              y: 493,
            },
            {
              x: 576,
              y: 487,
            },
          ],
          span: {
            offset: 9,
            length: 8,
          },
          confidence: 0.995,
        },
        {
          content: "MUSGRAVE",
          polygon: [
            {
              x: 151,
              y: 484,
            },
            {
              x: 539,
              y: 496,
            },
            {
              x: 537,
              y: 591,
            },
            {
              x: 146,
              y: 572,
            },
          ],
          span: {
            offset: 18,
            length: 8,
          },
          confidence: 0.995,
        },
        {
          content: "ESPAÑA",
          polygon: [
            {
              x: 582,
              y: 497,
            },
            {
              x: 869,
              y: 504,
            },
            {
              x: 869,
              y: 600,
            },
            {
              x: 580,
              y: 593,
            },
          ],
          span: {
            offset: 27,
            length: 6,
          },
          confidence: 0.981,
        },
        {
          content: "S.A.U.",
          polygon: [
            {
              x: 911,
              y: 505,
            },
            {
              x: 1175,
              y: 510,
            },
            {
              x: 1178,
              y: 600,
            },
            {
              x: 912,
              y: 600,
            },
          ],
          span: {
            offset: 34,
            length: 6,
          },
          confidence: 0.951,
        },
        {
          content: "AVD.",
          polygon: [
            {
              x: 150,
              y: 588,
            },
            {
              x: 354,
              y: 598,
            },
            {
              x: 349,
              y: 689,
            },
            {
              x: 145,
              y: 674,
            },
          ],
          span: {
            offset: 41,
            length: 4,
          },
          confidence: 0.991,
        },
        {
          content: "SANCHEZ",
          polygon: [
            {
              x: 391,
              y: 600,
            },
            {
              x: 734,
              y: 609,
            },
            {
              x: 731,
              y: 705,
            },
            {
              x: 387,
              y: 691,
            },
          ],
          span: {
            offset: 46,
            length: 7,
          },
          confidence: 0.995,
        },
        {
          content: "LOZANO,",
          polygon: [
            {
              x: 771,
              y: 609,
            },
            {
              x: 1108,
              y: 608,
            },
            {
              x: 1107,
              y: 707,
            },
            {
              x: 769,
              y: 706,
            },
          ],
          span: {
            offset: 54,
            length: 7,
          },
          confidence: 0.994,
        },
        {
          content: "S/N,",
          polygon: [
            {
              x: 1145,
              y: 608,
            },
            {
              x: 1338,
              y: 603,
            },
            {
              x: 1339,
              y: 701,
            },
            {
              x: 1145,
              y: 706,
            },
          ],
          span: {
            offset: 62,
            length: 4,
          },
          confidence: 0.981,
        },
        {
          content: "PARC-C",
          polygon: [
            {
              x: 1369,
              y: 602,
            },
            {
              x: 1656,
              y: 589,
            },
            {
              x: 1658,
              y: 685,
            },
            {
              x: 1370,
              y: 700,
            },
          ],
          span: {
            offset: 67,
            length: 6,
          },
          confidence: 0.994,
        },
        {
          content: "EL",
          polygon: [
            {
              x: 151,
              y: 698,
            },
            {
              x: 243,
              y: 701,
            },
            {
              x: 240,
              y: 790,
            },
            {
              x: 147,
              y: 785,
            },
          ],
          span: {
            offset: 74,
            length: 2,
          },
          confidence: 0.995,
        },
        {
          content: "PILAR",
          polygon: [
            {
              x: 290,
              y: 703,
            },
            {
              x: 530,
              y: 710,
            },
            {
              x: 528,
              y: 802,
            },
            {
              x: 287,
              y: 793,
            },
          ],
          span: {
            offset: 77,
            length: 5,
          },
          confidence: 0.995,
        },
        {
          content: "DE",
          polygon: [
            {
              x: 583,
              y: 711,
            },
            {
              x: 682,
              y: 713,
            },
            {
              x: 682,
              y: 805,
            },
            {
              x: 581,
              y: 803,
            },
          ],
          span: {
            offset: 83,
            length: 2,
          },
          confidence: 0.995,
        },
        {
          content: "LA",
          polygon: [
            {
              x: 723,
              y: 714,
            },
            {
              x: 823,
              y: 715,
            },
            {
              x: 823,
              y: 806,
            },
            {
              x: 723,
              y: 806,
            },
          ],
          span: {
            offset: 86,
            length: 2,
          },
          confidence: 0.995,
        },
        {
          content: "HORADADA",
          polygon: [
            {
              x: 864,
              y: 716,
            },
            {
              x: 1240,
              y: 718,
            },
            {
              x: 1243,
              y: 801,
            },
            {
              x: 864,
              y: 806,
            },
          ],
          span: {
            offset: 89,
            length: 8,
          },
          confidence: 0.994,
        },
        {
          content: "CIF:A80837941",
          polygon: [
            {
              x: 149,
              y: 801,
            },
            {
              x: 785,
              y: 816,
            },
            {
              x: 784,
              y: 908,
            },
            {
              x: 147,
              y: 889,
            },
          ],
          span: {
            offset: 98,
            length: 13,
          },
          confidence: 0.948,
        },
        {
          content: "TLF:966746749",
          polygon: [
            {
              x: 826,
              y: 817,
            },
            {
              x: 1424,
              y: 813,
            },
            {
              x: 1425,
              y: 895,
            },
            {
              x: 825,
              y: 908,
            },
          ],
          span: {
            offset: 112,
            length: 13,
          },
          confidence: 0.941,
        },
        {
          content: "FRA.SIMP:99273010058098",
          polygon: [
            {
              x: 149,
              y: 910,
            },
            {
              x: 1245,
              y: 918,
            },
            {
              x: 1249,
              y: 1003,
            },
            {
              x: 145,
              y: 995,
            },
          ],
          span: {
            offset: 126,
            length: 23,
          },
          confidence: 0.923,
        },
        {
          content: "FECHA:",
          polygon: [
            {
              x: 147,
              y: 1015,
            },
            {
              x: 430,
              y: 1021,
            },
            {
              x: 429,
              y: 1119,
            },
            {
              x: 145,
              y: 1108,
            },
          ],
          span: {
            offset: 150,
            length: 6,
          },
          confidence: 0.863,
        },
        {
          content: "15/05/2025",
          polygon: [
            {
              x: 448,
              y: 1021,
            },
            {
              x: 915,
              y: 1022,
            },
            {
              x: 916,
              y: 1117,
            },
            {
              x: 447,
              y: 1119,
            },
          ],
          span: {
            offset: 157,
            length: 10,
          },
          confidence: 0.982,
        },
        {
          content: "16:04:32",
          polygon: [
            {
              x: 975,
              y: 1022,
            },
            {
              x: 1340,
              y: 1016,
            },
            {
              x: 1344,
              y: 1093,
            },
            {
              x: 977,
              y: 1115,
            },
          ],
          span: {
            offset: 168,
            length: 8,
          },
          confidence: 0.977,
        },
        {
          content: "CAJERO/A:VLADA",
          polygon: [
            {
              x: 148,
              y: 1126,
            },
            {
              x: 820,
              y: 1129,
            },
            {
              x: 820,
              y: 1222,
            },
            {
              x: 146,
              y: 1218,
            },
          ],
          span: {
            offset: 177,
            length: 14,
          },
          confidence: 0.884,
        },
        {
          content: "Caja:01",
          polygon: [
            {
              x: 1387,
              y: 1113,
            },
            {
              x: 1711,
              y: 1100,
            },
            {
              x: 1715,
              y: 1187,
            },
            {
              x: 1390,
              y: 1198,
            },
          ],
          span: {
            offset: 192,
            length: 7,
          },
          confidence: 0.939,
        },
        {
          content: "ARTICULO",
          polygon: [
            {
              x: 143,
              y: 1343,
            },
            {
              x: 526,
              y: 1343,
            },
            {
              x: 527,
              y: 1425,
            },
            {
              x: 140,
              y: 1428,
            },
          ],
          span: {
            offset: 200,
            length: 8,
          },
          confidence: 0.962,
        },
        {
          content: "IMPORTE",
          polygon: [
            {
              x: 1400,
              y: 1309,
            },
            {
              x: 1727,
              y: 1301,
            },
            {
              x: 1732,
              y: 1382,
            },
            {
              x: 1402,
              y: 1391,
            },
          ],
          span: {
            offset: 209,
            length: 7,
          },
          confidence: 0.993,
        },
        {
          content: "CER.CORONA.35",
          polygon: [
            {
              x: 114,
              y: 1527,
            },
            {
              x: 753,
              y: 1520,
            },
            {
              x: 754,
              y: 1595,
            },
            {
              x: 112,
              y: 1598,
            },
          ],
          span: {
            offset: 217,
            length: 13,
          },
          confidence: 0.962,
        },
        {
          content: "CL",
          polygon: [
            {
              x: 811,
              y: 1519,
            },
            {
              x: 898,
              y: 1518,
            },
            {
              x: 899,
              y: 1593,
            },
            {
              x: 812,
              y: 1594,
            },
          ],
          span: {
            offset: 231,
            length: 2,
          },
          confidence: 0.997,
        },
        {
          content: "27,00",
          polygon: [
            {
              x: 1497,
              y: 1499,
            },
            {
              x: 1730,
              y: 1497,
            },
            {
              x: 1731,
              y: 1582,
            },
            {
              x: 1498,
              y: 1584,
            },
          ],
          span: {
            offset: 234,
            length: 5,
          },
          confidence: 0.995,
        },
        {
          content: "18,000",
          polygon: [
            {
              x: 221,
              y: 1621,
            },
            {
              x: 510,
              y: 1620,
            },
            {
              x: 511,
              y: 1713,
            },
            {
              x: 221,
              y: 1713,
            },
          ],
          span: {
            offset: 240,
            length: 6,
          },
          confidence: 0.993,
        },
        {
          content: "x",
          polygon: [
            {
              x: 572,
              y: 1619,
            },
            {
              x: 617,
              y: 1619,
            },
            {
              x: 618,
              y: 1713,
            },
            {
              x: 573,
              y: 1713,
            },
          ],
          span: {
            offset: 247,
            length: 1,
          },
          confidence: 0.579,
        },
        {
          content: "1,50",
          polygon: [
            {
              x: 921,
              y: 1610,
            },
            {
              x: 1105,
              y: 1607,
            },
            {
              x: 1107,
              y: 1703,
            },
            {
              x: 921,
              y: 1707,
            },
          ],
          span: {
            offset: 249,
            length: 4,
          },
          confidence: 0.992,
        },
        {
          content: "***",
          polygon: [
            {
              x: 807,
              y: 1726,
            },
            {
              x: 953,
              y: 1724,
            },
            {
              x: 953,
              y: 1814,
            },
            {
              x: 808,
              y: 1814,
            },
          ],
          span: {
            offset: 254,
            length: 3,
          },
          confidence: 0.983,
        },
        {
          content: "OFERTAS",
          polygon: [
            {
              x: 999,
              y: 1723,
            },
            {
              x: 1341,
              y: 1721,
            },
            {
              x: 1343,
              y: 1809,
            },
            {
              x: 1000,
              y: 1814,
            },
          ],
          span: {
            offset: 258,
            length: 7,
          },
          confidence: 0.993,
        },
        {
          content: "***",
          polygon: [
            {
              x: 1393,
              y: 1721,
            },
            {
              x: 1540,
              y: 1721,
            },
            {
              x: 1543,
              y: 1803,
            },
            {
              x: 1396,
              y: 1808,
            },
          ],
          span: {
            offset: 266,
            length: 3,
          },
          confidence: 0.938,
        },
        {
          content: "COLA",
          polygon: [
            {
              x: 110,
              y: 1852,
            },
            {
              x: 319,
              y: 1848,
            },
            {
              x: 320,
              y: 1943,
            },
            {
              x: 110,
              y: 1945,
            },
          ],
          span: {
            offset: 270,
            length: 4,
          },
          confidence: 0.99,
        },
        {
          content: "ZERO",
          polygon: [
            {
              x: 369,
              y: 1847,
            },
            {
              x: 561,
              y: 1844,
            },
            {
              x: 562,
              y: 1939,
            },
            {
              x: 369,
              y: 1942,
            },
          ],
          span: {
            offset: 275,
            length: 4,
          },
          confidence: 0.951,
        },
        {
          content: "LATA",
          polygon: [
            {
              x: 611,
              y: 1844,
            },
            {
              x: 816,
              y: 1843,
            },
            {
              x: 817,
              y: 1937,
            },
            {
              x: 612,
              y: 1939,
            },
          ],
          span: {
            offset: 280,
            length: 4,
          },
          confidence: 0.989,
        },
        {
          content: "9,96",
          polygon: [
            {
              x: 1542,
              y: 1838,
            },
            {
              x: 1740,
              y: 1830,
            },
            {
              x: 1744,
              y: 1923,
            },
            {
              x: 1546,
              y: 1931,
            },
          ],
          span: {
            offset: 285,
            length: 4,
          },
          confidence: 0.992,
        },
        {
          content: "SERV.S.MIGUEL",
          polygon: [
            {
              x: 108,
              y: 1969,
            },
            {
              x: 767,
              y: 1956,
            },
            {
              x: 769,
              y: 2052,
            },
            {
              x: 110,
              y: 2063,
            },
          ],
          span: {
            offset: 290,
            length: 13,
          },
          confidence: 0.705,
        },
        {
          content: "33",
          polygon: [
            {
              x: 824,
              y: 1956,
            },
            {
              x: 919,
              y: 1955,
            },
            {
              x: 922,
              y: 2049,
            },
            {
              x: 826,
              y: 2051,
            },
          ],
          span: {
            offset: 304,
            length: 2,
          },
          confidence: 0.997,
        },
        {
          content: "5,99",
          polygon: [
            {
              x: 1545,
              y: 1951,
            },
            {
              x: 1738,
              y: 1945,
            },
            {
              x: 1742,
              y: 2034,
            },
            {
              x: 1548,
              y: 2042,
            },
          ],
          span: {
            offset: 307,
            length: 4,
          },
          confidence: 0.992,
        },
        {
          content: "TOTAL",
          polygon: [
            {
              x: 118,
              y: 2199,
            },
            {
              x: 369,
              y: 2198,
            },
            {
              x: 370,
              y: 2288,
            },
            {
              x: 119,
              y: 2291,
            },
          ],
          span: {
            offset: 312,
            length: 5,
          },
          confidence: 0.994,
        },
        {
          content: "42,95",
          polygon: [
            {
              x: 1507,
              y: 2170,
            },
            {
              x: 1748,
              y: 2168,
            },
            {
              x: 1749,
              y: 2269,
            },
            {
              x: 1507,
              y: 2271,
            },
          ],
          span: {
            offset: 318,
            length: 5,
          },
          confidence: 0.995,
        },
        {
          content: "Datáfono.",
          polygon: [
            {
              x: 118,
              y: 2434,
            },
            {
              x: 583,
              y: 2423,
            },
            {
              x: 584,
              y: 2519,
            },
            {
              x: 118,
              y: 2528,
            },
          ],
          span: {
            offset: 324,
            length: 9,
          },
          confidence: 0.972,
        },
        {
          content: "42,95",
          polygon: [
            {
              x: 1512,
              y: 2403,
            },
            {
              x: 1753,
              y: 2398,
            },
            {
              x: 1755,
              y: 2493,
            },
            {
              x: 1514,
              y: 2499,
            },
          ],
          span: {
            offset: 334,
            length: 5,
          },
          confidence: 0.995,
        },
        {
          content: "IMP.",
          polygon: [
            {
              x: 176,
              y: 2551,
            },
            {
              x: 363,
              y: 2548,
            },
            {
              x: 365,
              y: 2641,
            },
            {
              x: 178,
              y: 2644,
            },
          ],
          span: {
            offset: 340,
            length: 4,
          },
          confidence: 0.945,
        },
        {
          content: "BASE",
          polygon: [
            {
              x: 725,
              y: 2531,
            },
            {
              x: 925,
              y: 2529,
            },
            {
              x: 926,
              y: 2624,
            },
            {
              x: 725,
              y: 2626,
            },
          ],
          span: {
            offset: 345,
            length: 4,
          },
          confidence: 0.982,
        },
        {
          content: "CUOTA",
          polygon: [
            {
              x: 1220,
              y: 2524,
            },
            {
              x: 1464,
              y: 2519,
            },
            {
              x: 1466,
              y: 2606,
            },
            {
              x: 1220,
              y: 2612,
            },
          ],
          span: {
            offset: 350,
            length: 5,
          },
          confidence: 0.992,
        },
        {
          content: "21,00",
          polygon: [
            {
              x: 122,
              y: 2789,
            },
            {
              x: 371,
              y: 2783,
            },
            {
              x: 374,
              y: 2884,
            },
            {
              x: 125,
              y: 2892,
            },
          ],
          span: {
            offset: 356,
            length: 5,
          },
          confidence: 0.995,
        },
        {
          content: "35,50",
          polygon: [
            {
              x: 679,
              y: 2767,
            },
            {
              x: 929,
              y: 2763,
            },
            {
              x: 931,
              y: 2865,
            },
            {
              x: 679,
              y: 2870,
            },
          ],
          span: {
            offset: 362,
            length: 5,
          },
          confidence: 0.99,
        },
        {
          content: "7,45",
          polygon: [
            {
              x: 1280,
              y: 2754,
            },
            {
              x: 1469,
              y: 2752,
            },
            {
              x: 1470,
              y: 2852,
            },
            {
              x: 1282,
              y: 2854,
            },
          ],
          span: {
            offset: 368,
            length: 4,
          },
          confidence: 0.991,
        },
      ],
      lines: [
        {
          content: "DX TORRE HORADADA",
          polygon: [
            {
              x: 149,
              y: 382,
            },
            {
              x: 966,
              y: 408,
            },
            {
              x: 964,
              y: 493,
            },
            {
              x: 146,
              y: 471,
            },
          ],
          spans: [
            {
              offset: 0,
              length: 17,
            },
          ],
        },
        {
          content: "MUSGRAVE ESPAÑA S.A.U.",
          polygon: [
            {
              x: 147,
              y: 484,
            },
            {
              x: 1181,
              y: 510,
            },
            {
              x: 1180,
              y: 600,
            },
            {
              x: 145,
              y: 579,
            },
          ],
          spans: [
            {
              offset: 18,
              length: 22,
            },
          ],
        },
        {
          content: "AVD. SANCHEZ LOZANO, S/N, PARC-C",
          polygon: [
            {
              x: 144,
              y: 588,
            },
            {
              x: 1661,
              y: 588,
            },
            {
              x: 1661,
              y: 707,
            },
            {
              x: 144,
              y: 703,
            },
          ],
          spans: [
            {
              offset: 41,
              length: 32,
            },
          ],
        },
        {
          content: "EL PILAR DE LA HORADADA",
          polygon: [
            {
              x: 148,
              y: 697,
            },
            {
              x: 1244,
              y: 716,
            },
            {
              x: 1243,
              y: 806,
            },
            {
              x: 147,
              y: 794,
            },
          ],
          spans: [
            {
              offset: 74,
              length: 23,
            },
          ],
        },
        {
          content: "CIF:A80837941 TLF:966746749",
          polygon: [
            {
              x: 147,
              y: 800,
            },
            {
              x: 1429,
              y: 809,
            },
            {
              x: 1428,
              y: 908,
            },
            {
              x: 146,
              y: 902,
            },
          ],
          spans: [
            {
              offset: 98,
              length: 27,
            },
          ],
        },
        {
          content: "FRA.SIMP:99273010058098",
          polygon: [
            {
              x: 145,
              y: 909,
            },
            {
              x: 1250,
              y: 918,
            },
            {
              x: 1249,
              y: 1012,
            },
            {
              x: 144,
              y: 1006,
            },
          ],
          spans: [
            {
              offset: 126,
              length: 23,
            },
          ],
        },
        {
          content: "FECHA: 15/05/2025 16:04:32",
          polygon: [
            {
              x: 144,
              y: 1015,
            },
            {
              x: 1346,
              y: 1015,
            },
            {
              x: 1347,
              y: 1115,
            },
            {
              x: 144,
              y: 1120,
            },
          ],
          spans: [
            {
              offset: 150,
              length: 26,
            },
          ],
        },
        {
          content: "CAJERO/A:VLADA",
          polygon: [
            {
              x: 145,
              y: 1126,
            },
            {
              x: 824,
              y: 1128,
            },
            {
              x: 824,
              y: 1224,
            },
            {
              x: 145,
              y: 1222,
            },
          ],
          spans: [
            {
              offset: 177,
              length: 14,
            },
          ],
        },
        {
          content: "Caja:01",
          polygon: [
            {
              x: 1387,
              y: 1112,
            },
            {
              x: 1713,
              y: 1099,
            },
            {
              x: 1716,
              y: 1185,
            },
            {
              x: 1390,
              y: 1198,
            },
          ],
          spans: [
            {
              offset: 192,
              length: 7,
            },
          ],
        },
        {
          content: "ARTICULO",
          polygon: [
            {
              x: 140,
              y: 1343,
            },
            {
              x: 535,
              y: 1342,
            },
            {
              x: 536,
              y: 1425,
            },
            {
              x: 140,
              y: 1428,
            },
          ],
          spans: [
            {
              offset: 200,
              length: 8,
            },
          ],
        },
        {
          content: "IMPORTE",
          polygon: [
            {
              x: 1396,
              y: 1308,
            },
            {
              x: 1733,
              y: 1300,
            },
            {
              x: 1735,
              y: 1381,
            },
            {
              x: 1397,
              y: 1390,
            },
          ],
          spans: [
            {
              offset: 209,
              length: 7,
            },
          ],
        },
        {
          content: "CER.CORONA.35 CL",
          polygon: [
            {
              x: 112,
              y: 1525,
            },
            {
              x: 907,
              y: 1517,
            },
            {
              x: 907,
              y: 1592,
            },
            {
              x: 112,
              y: 1598,
            },
          ],
          spans: [
            {
              offset: 217,
              length: 16,
            },
          ],
        },
        {
          content: "27,00",
          polygon: [
            {
              x: 1495,
              y: 1500,
            },
            {
              x: 1739,
              y: 1497,
            },
            {
              x: 1742,
              y: 1582,
            },
            {
              x: 1494,
              y: 1584,
            },
          ],
          spans: [
            {
              offset: 234,
              length: 5,
            },
          ],
        },
        {
          content: "18,000 x",
          polygon: [
            {
              x: 221,
              y: 1620,
            },
            {
              x: 618,
              y: 1619,
            },
            {
              x: 619,
              y: 1712,
            },
            {
              x: 221,
              y: 1713,
            },
          ],
          spans: [
            {
              offset: 240,
              length: 8,
            },
          ],
        },
        {
          content: "1,50",
          polygon: [
            {
              x: 922,
              y: 1611,
            },
            {
              x: 1106,
              y: 1607,
            },
            {
              x: 1109,
              y: 1703,
            },
            {
              x: 921,
              y: 1707,
            },
          ],
          spans: [
            {
              offset: 249,
              length: 4,
            },
          ],
        },
        {
          content: "*** OFERTAS ***",
          polygon: [
            {
              x: 803,
              y: 1725,
            },
            {
              x: 1542,
              y: 1720,
            },
            {
              x: 1543,
              y: 1807,
            },
            {
              x: 803,
              y: 1814,
            },
          ],
          spans: [
            {
              offset: 254,
              length: 15,
            },
          ],
        },
        {
          content: "COLA ZERO LATA",
          polygon: [
            {
              x: 109,
              y: 1850,
            },
            {
              x: 816,
              y: 1842,
            },
            {
              x: 817,
              y: 1934,
            },
            {
              x: 109,
              y: 1944,
            },
          ],
          spans: [
            {
              offset: 270,
              length: 14,
            },
          ],
        },
        {
          content: "9,96",
          polygon: [
            {
              x: 1541,
              y: 1840,
            },
            {
              x: 1742,
              y: 1830,
            },
            {
              x: 1747,
              y: 1923,
            },
            {
              x: 1541,
              y: 1930,
            },
          ],
          spans: [
            {
              offset: 285,
              length: 4,
            },
          ],
        },
        {
          content: "SERV.S.MIGUEL 33",
          polygon: [
            {
              x: 108,
              y: 1967,
            },
            {
              x: 919,
              y: 1954,
            },
            {
              x: 921,
              y: 2048,
            },
            {
              x: 109,
              y: 2062,
            },
          ],
          spans: [
            {
              offset: 290,
              length: 16,
            },
          ],
        },
        {
          content: "5,99",
          polygon: [
            {
              x: 1545,
              y: 1951,
            },
            {
              x: 1742,
              y: 1945,
            },
            {
              x: 1747,
              y: 2031,
            },
            {
              x: 1550,
              y: 2042,
            },
          ],
          spans: [
            {
              offset: 307,
              length: 4,
            },
          ],
        },
        {
          content: "TOTAL",
          polygon: [
            {
              x: 114,
              y: 2199,
            },
            {
              x: 378,
              y: 2198,
            },
            {
              x: 380,
              y: 2287,
            },
            {
              x: 114,
              y: 2292,
            },
          ],
          spans: [
            {
              offset: 312,
              length: 5,
            },
          ],
        },
        {
          content: "42,95",
          polygon: [
            {
              x: 1508,
              y: 2172,
            },
            {
              x: 1750,
              y: 2168,
            },
            {
              x: 1752,
              y: 2269,
            },
            {
              x: 1507,
              y: 2270,
            },
          ],
          spans: [
            {
              offset: 318,
              length: 5,
            },
          ],
        },
        {
          content: "Datáfono.",
          polygon: [
            {
              x: 117,
              y: 2433,
            },
            {
              x: 593,
              y: 2423,
            },
            {
              x: 596,
              y: 2520,
            },
            {
              x: 117,
              y: 2528,
            },
          ],
          spans: [
            {
              offset: 324,
              length: 9,
            },
          ],
        },
        {
          content: "42,95",
          polygon: [
            {
              x: 1512,
              y: 2404,
            },
            {
              x: 1751,
              y: 2398,
            },
            {
              x: 1760,
              y: 2493,
            },
            {
              x: 1517,
              y: 2499,
            },
          ],
          spans: [
            {
              offset: 334,
              length: 5,
            },
          ],
        },
        {
          content: "IMP.",
          polygon: [
            {
              x: 173,
              y: 2551,
            },
            {
              x: 366,
              y: 2548,
            },
            {
              x: 367,
              y: 2641,
            },
            {
              x: 173,
              y: 2645,
            },
          ],
          spans: [
            {
              offset: 340,
              length: 4,
            },
          ],
        },
        {
          content: "BASE",
          polygon: [
            {
              x: 725,
              y: 2532,
            },
            {
              x: 928,
              y: 2529,
            },
            {
              x: 931,
              y: 2624,
            },
            {
              x: 725,
              y: 2626,
            },
          ],
          spans: [
            {
              offset: 345,
              length: 4,
            },
          ],
        },
        {
          content: "CUOTA",
          polygon: [
            {
              x: 1220,
              y: 2525,
            },
            {
              x: 1466,
              y: 2519,
            },
            {
              x: 1467,
              y: 2607,
            },
            {
              x: 1220,
              y: 2613,
            },
          ],
          spans: [
            {
              offset: 350,
              length: 5,
            },
          ],
        },
        {
          content: "21,00",
          polygon: [
            {
              x: 121,
              y: 2789,
            },
            {
              x: 374,
              y: 2783,
            },
            {
              x: 377,
              y: 2883,
            },
            {
              x: 120,
              y: 2893,
            },
          ],
          spans: [
            {
              offset: 356,
              length: 5,
            },
          ],
        },
        {
          content: "35,50",
          polygon: [
            {
              x: 679,
              y: 2769,
            },
            {
              x: 929,
              y: 2763,
            },
            {
              x: 934,
              y: 2865,
            },
            {
              x: 679,
              y: 2869,
            },
          ],
          spans: [
            {
              offset: 362,
              length: 5,
            },
          ],
        },
        {
          content: "7,45",
          polygon: [
            {
              x: 1271,
              y: 2755,
            },
            {
              x: 1472,
              y: 2752,
            },
            {
              x: 1473,
              y: 2852,
            },
            {
              x: 1270,
              y: 2854,
            },
          ],
          spans: [
            {
              offset: 368,
              length: 4,
            },
          ],
        },
      ],
    },
  ],
  styles: [],
  documents: [
    {
      docType: "receipt.retailMeal",
      boundingRegions: [
        {
          pageNumber: 1,
          polygon: [
            {
              x: 0,
              y: 0,
            },
            {
              x: 2273,
              y: 0,
            },
            {
              x: 2273,
              y: 3500,
            },
            {
              x: 0,
              y: 3500,
            },
          ],
        },
      ],
      spans: [
        {
          offset: 0,
          length: 372,
        },
      ],
      fields: {
        Items: {
          kind: "array",
          values: [
            {
              kind: "object",
              properties: {
                Description: {
                  kind: "string",
                  value: "CER.CORONA.35 CL",
                  boundingRegions: [
                    {
                      pageNumber: 1,
                      polygon: [
                        {
                          x: 111,
                          y: 1524,
                        },
                        {
                          x: 898,
                          y: 1518,
                        },
                        {
                          x: 899,
                          y: 1594,
                        },
                        {
                          x: 112,
                          y: 1600,
                        },
                      ],
                    },
                  ],
                  content: "CER.CORONA.35 CL",
                  spans: [
                    {
                      offset: 217,
                      length: 16,
                    },
                  ],
                  confidence: 0.98,
                },
                Price: {
                  kind: "number",
                  value: 1.5,
                  boundingRegions: [
                    {
                      pageNumber: 1,
                      polygon: [
                        {
                          x: 921,
                          y: 1610,
                        },
                        {
                          x: 1105,
                          y: 1607,
                        },
                        {
                          x: 1107,
                          y: 1703,
                        },
                        {
                          x: 921,
                          y: 1707,
                        },
                      ],
                    },
                  ],
                  content: "1,50",
                  spans: [
                    {
                      offset: 249,
                      length: 4,
                    },
                  ],
                  confidence: 0.985,
                },
                Quantity: {
                  kind: "number",
                  value: 18,
                  boundingRegions: [
                    {
                      pageNumber: 1,
                      polygon: [
                        {
                          x: 221,
                          y: 1621,
                        },
                        {
                          x: 510,
                          y: 1620,
                        },
                        {
                          x: 511,
                          y: 1713,
                        },
                        {
                          x: 221,
                          y: 1713,
                        },
                      ],
                    },
                  ],
                  content: "18,000",
                  spans: [
                    {
                      offset: 240,
                      length: 6,
                    },
                  ],
                  confidence: 0.987,
                },
                TotalPrice: {
                  kind: "number",
                  value: 27,
                  boundingRegions: [
                    {
                      pageNumber: 1,
                      polygon: [
                        {
                          x: 1497,
                          y: 1499,
                        },
                        {
                          x: 1730,
                          y: 1497,
                        },
                        {
                          x: 1731,
                          y: 1582,
                        },
                        {
                          x: 1498,
                          y: 1584,
                        },
                      ],
                    },
                  ],
                  content: "27,00",
                  spans: [
                    {
                      offset: 234,
                      length: 5,
                    },
                  ],
                  confidence: 0.985,
                },
              },
              boundingRegions: [
                {
                  pageNumber: 1,
                  polygon: [
                    {
                      x: 111,
                      y: 1510,
                    },
                    {
                      x: 1730,
                      y: 1497,
                    },
                    {
                      x: 1732,
                      y: 1704,
                    },
                    {
                      x: 113,
                      y: 1717,
                    },
                  ],
                },
              ],
              content: "CER.CORONA.35 CL\n27,00\n18,000 x\n1,50",
              spans: [
                {
                  offset: 217,
                  length: 36,
                },
              ],
              confidence: 0.969,
            },
            {
              kind: "object",
              properties: {
                Description: {
                  kind: "string",
                  value: "COLA ZERO LATA",
                  boundingRegions: [
                    {
                      pageNumber: 1,
                      polygon: [
                        {
                          x: 109,
                          y: 1850,
                        },
                        {
                          x: 816,
                          y: 1840,
                        },
                        {
                          x: 817,
                          y: 1937,
                        },
                        {
                          x: 110,
                          y: 1947,
                        },
                      ],
                    },
                  ],
                  content: "COLA ZERO LATA",
                  spans: [
                    {
                      offset: 270,
                      length: 14,
                    },
                  ],
                  confidence: 0.98,
                },
                TotalPrice: {
                  kind: "number",
                  value: 9.96,
                  boundingRegions: [
                    {
                      pageNumber: 1,
                      polygon: [
                        {
                          x: 1542,
                          y: 1838,
                        },
                        {
                          x: 1740,
                          y: 1830,
                        },
                        {
                          x: 1744,
                          y: 1923,
                        },
                        {
                          x: 1546,
                          y: 1931,
                        },
                      ],
                    },
                  ],
                  content: "9,96",
                  spans: [
                    {
                      offset: 285,
                      length: 4,
                    },
                  ],
                  confidence: 0.985,
                },
              },
              boundingRegions: [
                {
                  pageNumber: 1,
                  polygon: [
                    {
                      x: 109,
                      y: 1850,
                    },
                    {
                      x: 1743,
                      y: 1827,
                    },
                    {
                      x: 1744,
                      y: 1928,
                    },
                    {
                      x: 110,
                      y: 1952,
                    },
                  ],
                },
              ],
              content: "COLA ZERO LATA\n9,96",
              spans: [
                {
                  offset: 270,
                  length: 19,
                },
              ],
              confidence: 0.976,
            },
            {
              kind: "object",
              properties: {
                Description: {
                  kind: "string",
                  value: "SERV.S.MIGUEL 33",
                  boundingRegions: [
                    {
                      pageNumber: 1,
                      polygon: [
                        {
                          x: 108,
                          y: 1966,
                        },
                        {
                          x: 921,
                          y: 1954,
                        },
                        {
                          x: 922,
                          y: 2050,
                        },
                        {
                          x: 109,
                          y: 2063,
                        },
                      ],
                    },
                  ],
                  content: "SERV.S.MIGUEL 33",
                  spans: [
                    {
                      offset: 290,
                      length: 16,
                    },
                  ],
                  confidence: 0.978,
                },
                TotalPrice: {
                  kind: "number",
                  value: 5.99,
                  boundingRegions: [
                    {
                      pageNumber: 1,
                      polygon: [
                        {
                          x: 1545,
                          y: 1951,
                        },
                        {
                          x: 1738,
                          y: 1945,
                        },
                        {
                          x: 1742,
                          y: 2034,
                        },
                        {
                          x: 1548,
                          y: 2042,
                        },
                      ],
                    },
                  ],
                  content: "5,99",
                  spans: [
                    {
                      offset: 307,
                      length: 4,
                    },
                  ],
                  confidence: 0.985,
                },
              },
              boundingRegions: [
                {
                  pageNumber: 1,
                  polygon: [
                    {
                      x: 108,
                      y: 1968,
                    },
                    {
                      x: 1740,
                      y: 1938,
                    },
                    {
                      x: 1742,
                      y: 2038,
                    },
                    {
                      x: 110,
                      y: 2068,
                    },
                  ],
                },
              ],
              content: "SERV.S.MIGUEL 33\n5,99",
              spans: [
                {
                  offset: 290,
                  length: 21,
                },
              ],
              confidence: 0.977,
            },
          ],
        },
        MerchantAddress: {
          kind: "address",
          value: {
            road: "AVD. SANCHEZ LOZANO, S/N, PARC-C\nEL",
            city: "PILAR DE LA",
            streetAddress: "AVD. SANCHEZ LOZANO, S/N, PARC-C\nEL",
            house: "HORADADA",
          },
          boundingRegions: [
            {
              pageNumber: 1,
              polygon: [
                {
                  x: 147,
                  y: 559,
                },
                {
                  x: 1660,
                  y: 589,
                },
                {
                  x: 1655,
                  y: 825,
                },
                {
                  x: 143,
                  y: 794,
                },
              ],
            },
          ],
          content: "AVD. SANCHEZ LOZANO, S/N, PARC-C\nEL PILAR DE LA HORADADA",
          spans: [
            {
              offset: 41,
              length: 56,
            },
          ],
          confidence: 0.981,
        },
        MerchantName: {
          kind: "string",
          value: "MUSGRAVE ESPAÑA S.A.U.",
          boundingRegions: [
            {
              pageNumber: 1,
              polygon: [
                {
                  x: 148,
                  y: 484,
                },
                {
                  x: 1180,
                  y: 509,
                },
                {
                  x: 1178,
                  y: 608,
                },
                {
                  x: 146,
                  y: 582,
                },
              ],
            },
          ],
          content: "MUSGRAVE ESPAÑA S.A.U.",
          spans: [
            {
              offset: 18,
              length: 22,
            },
          ],
          confidence: 0.972,
        },
        MerchantPhoneNumber: {
          kind: "phoneNumber",
          value: "+34966746749",
          boundingRegions: [
            {
              pageNumber: 1,
              polygon: [
                {
                  x: 826,
                  y: 817,
                },
                {
                  x: 1424,
                  y: 813,
                },
                {
                  x: 1425,
                  y: 895,
                },
                {
                  x: 825,
                  y: 908,
                },
              ],
            },
          ],
          content: "TLF:966746749",
          spans: [
            {
              offset: 112,
              length: 13,
            },
          ],
          confidence: 0.987,
        },
        TaxDetails: {
          kind: "array",
          values: [
            {
              kind: "object",
              properties: {
                Amount: {
                  kind: "currency",
                  value: {
                    amount: 7.45,
                    currencyCode: "EUR",
                  },
                  boundingRegions: [
                    {
                      pageNumber: 1,
                      polygon: [
                        {
                          x: 1280,
                          y: 2754,
                        },
                        {
                          x: 1469,
                          y: 2752,
                        },
                        {
                          x: 1470,
                          y: 2852,
                        },
                        {
                          x: 1282,
                          y: 2854,
                        },
                      ],
                    },
                  ],
                  content: "7,45",
                  spans: [
                    {
                      offset: 368,
                      length: 4,
                    },
                  ],
                  confidence: 0.985,
                },
              },
              boundingRegions: [
                {
                  pageNumber: 1,
                  polygon: [
                    {
                      x: 122,
                      y: 2775,
                    },
                    {
                      x: 1469,
                      y: 2751,
                    },
                    {
                      x: 1471,
                      y: 2868,
                    },
                    {
                      x: 124,
                      y: 2892,
                    },
                  ],
                },
              ],
              content: "21,00\n35,50\n7,45",
              spans: [
                {
                  offset: 356,
                  length: 16,
                },
              ],
              confidence: 0.985,
            },
          ],
        },
        Total: {
          kind: "number",
          value: 42.95,
          boundingRegions: [
            {
              pageNumber: 1,
              polygon: [
                {
                  x: 1507,
                  y: 2170,
                },
                {
                  x: 1748,
                  y: 2168,
                },
                {
                  x: 1749,
                  y: 2269,
                },
                {
                  x: 1507,
                  y: 2271,
                },
              ],
            },
          ],
          content: "42,95",
          spans: [
            {
              offset: 318,
              length: 5,
            },
          ],
          confidence: 0.979,
        },
        TotalTax: {
          kind: "number",
          value: 7.45,
          boundingRegions: [
            {
              pageNumber: 1,
              polygon: [
                {
                  x: 1280,
                  y: 2754,
                },
                {
                  x: 1469,
                  y: 2752,
                },
                {
                  x: 1470,
                  y: 2852,
                },
                {
                  x: 1282,
                  y: 2854,
                },
              ],
            },
          ],
          content: "7,45",
          spans: [
            {
              offset: 368,
              length: 4,
            },
          ],
          confidence: 0.985,
        },
        TransactionDate: {
          kind: "date",
          value: "2025-05-15T00:00:00.000Z",
          boundingRegions: [
            {
              pageNumber: 1,
              polygon: [
                {
                  x: 448,
                  y: 1021,
                },
                {
                  x: 915,
                  y: 1022,
                },
                {
                  x: 916,
                  y: 1117,
                },
                {
                  x: 447,
                  y: 1119,
                },
              ],
            },
          ],
          content: "15/05/2025",
          spans: [
            {
              offset: 157,
              length: 10,
            },
          ],
          confidence: 0.987,
        },
        TransactionTime: {
          kind: "time",
          value: "16:04:32",
          boundingRegions: [
            {
              pageNumber: 1,
              polygon: [
                {
                  x: 975,
                  y: 1022,
                },
                {
                  x: 1340,
                  y: 1016,
                },
                {
                  x: 1344,
                  y: 1093,
                },
                {
                  x: 977,
                  y: 1115,
                },
              ],
            },
          ],
          content: "16:04:32",
          spans: [
            {
              offset: 168,
              length: 8,
            },
          ],
          confidence: 0.987,
        },
      },
      confidence: 0.987,
    },
  ],
};

export function tryFindCurrencyCode() {
  const receipt = AzureReceiptSchema.parse(data.documents[0]);
  for (const field of Object.values(receipt.fields)) {
    console.log("Field kind:", field);
    const currencyCode = findCurrencyCode(field as unknown as FieldValue);
    
    if (currencyCode) {
      console.log("Currency code found:", currencyCode);
      break;
    }
  }
}
