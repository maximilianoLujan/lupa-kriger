import type { ProductBox } from '../../../types/article'

/**
 * Artículos hardcodeados para el MVP. Misma forma que devolverá la API.
 * Stock por sucursal usa los códigos de `warehouses.mock.ts`.
 */
export const MOCK_ARTICLES: ProductBox[] = [
  {
    articleCode: '10001',
    description: 'PASTILLA DE FRENO DELANTERA',
    details: ['PASTILLA DE FRENO DELANTERA', 'JUEGO X4', 'ANCHO 140 MM / ALTO 60 MM'],
    compatibleModels: [
      { brandName: 'VOLKSWAGEN', model: 'GOL TREND', since: '2008', until: '2023' },
      { brandName: 'VOLKSWAGEN', model: 'FOX', since: '2004', until: '2014' },
      { brandName: 'VOLKSWAGEN', model: 'SURAN', since: '2006', until: '2020' },
    ],
    alternatives: [
      { articleCode: '10001-1', particularCode: 'FR-1024', description: 'Pastilla freno delantera Fric-Rot', brandCode: 'FRR', brandName: 'FRIC-ROT', priceList: 28900, stock: { GUA: 12, DEP: 30 } },
      { articleCode: '10001-2', particularCode: 'HQF-2234C', description: 'Pastilla freno delantera Ferodo', brandCode: 'FER', brandName: 'FERODO', priceList: 34500, stock: { GUA: 4, DEP: 0 } },
      { articleCode: '10001-3', particularCode: 'N-1037', description: 'Pastilla freno delantera Cobreq', brandCode: 'COB', brandName: 'COBREQ', priceList: 22100, stock: { GUA: 0, DEP: 0 } },
    ],
  },
  {
    articleCode: '10002',
    description: 'FILTRO DE ACEITE',
    details: ['FILTRO DE ACEITE', 'ROSCA 3/4-16 UNF', 'ALTURA 79 MM'],
    compatibleModels: [
      { brandName: 'PEUGEOT', model: '206 1.4 / 1.6', since: '1999', until: '2012' },
      { brandName: 'PEUGEOT', model: '207 COMPACT', since: '2008', until: '2015' },
      { brandName: 'PEUGEOT', model: '208 1.6', since: '2013', until: '2020' },
      { brandName: 'CITROEN', model: 'C3 1.6', since: '2003', until: '2012' },
    ],
    alternatives: [
      { articleCode: '10002-1', particularCode: 'W 712/75', description: 'Filtro de aceite Mann', brandCode: 'MAN', brandName: 'MANN', priceList: 9800, stock: { GUA: 25, DEP: 60 } },
      { articleCode: '10002-2', particularCode: 'PH5796', description: 'Filtro de aceite Fram', brandCode: 'FRM', brandName: 'FRAM', priceList: 7650, stock: { GUA: 8, DEP: 12 } },
      { articleCode: '10002-3', particularCode: 'WO-120', description: 'Filtro de aceite Wega', brandCode: 'WEG', brandName: 'WEGA', priceList: 5900, stock: { GUA: 3, DEP: 0 } },
    ],
  },
  {
    articleCode: '10003',
    description: 'AMORTIGUADOR DELANTERO',
    details: ['AMORTIGUADOR DELANTERO', 'HIDRAULICO', 'SE VENDE POR UNIDAD'],
    compatibleModels: [
      { brandName: 'CHEVROLET', model: 'CORSA', since: '1994', until: '2010' },
      { brandName: 'CHEVROLET', model: 'CLASSIC', since: '2010', until: '2016' },
    ],
    alternatives: [
      { articleCode: '10003-1', particularCode: 'G7322', description: 'Amortiguador delantero Monroe', brandCode: 'MON', brandName: 'MONROE', priceList: 68400, stock: { GUA: 2, DEP: 6 } },
      { articleCode: '10003-2', particularCode: '32041', description: 'Amortiguador delantero Corven', brandCode: 'COR', brandName: 'CORVEN', priceList: 49900, stock: { GUA: 6, DEP: 10 } },
      { articleCode: '10003-3', particularCode: '315 889', description: 'Amortiguador delantero Sachs', brandCode: 'SAC', brandName: 'SACHS', priceList: 81200, stock: { GUA: 0, DEP: 2 } },
    ],
  },
  {
    articleCode: '10004',
    description: 'BUJIA DE ENCENDIDO',
    details: ['BUJIA DE ENCENDIDO', 'ROSCA 14 MM', 'MOTOR FIRE 1.3 / 1.4'],
    compatibleModels: [
      { brandName: 'FIAT', model: 'PALIO', since: '2001', until: '2017' },
      { brandName: 'FIAT', model: 'SIENA', since: '2001', until: '2017' },
      { brandName: 'FIAT', model: 'UNO', since: '2010', until: '2020' },
      { brandName: 'FIAT', model: 'MOBI', since: '2017' },
    ],
    alternatives: [
      { articleCode: '10004-1', particularCode: 'BKR6E', description: 'Bujía NGK', brandCode: 'NGK', brandName: 'NGK', priceList: 4200, stock: { GUA: 40, DEP: 120 } },
      { articleCode: '10004-2', particularCode: 'FR7DC+', description: 'Bujía Bosch Super Plus', brandCode: 'BOS', brandName: 'BOSCH', priceList: 4950, stock: { GUA: 16, DEP: 48 } },
      { articleCode: '10004-3', particularCode: 'RC9YC', description: 'Bujía Champion', brandCode: 'CHA', brandName: 'CHAMPION', priceList: 3700, stock: { GUA: 0, DEP: 24 } },
    ],
  },
  {
    articleCode: '10005',
    description: 'CORREA POLY-V',
    details: ['CORREA POLY-V', '6PK 1740', 'ALTERNADOR / AIRE ACONDICIONADO'],
    compatibleModels: [
      { brandName: 'RENAULT', model: 'CLIO 1.6 16V', since: '2003', until: '2016' },
      { brandName: 'RENAULT', model: 'KANGOO 1.6', since: '2008', until: '2018' },
      { brandName: 'RENAULT', model: 'SANDERO 1.6', since: '2008', until: '2014' },
    ],
    alternatives: [
      { articleCode: '10005-1', particularCode: '6PK1740', description: 'Correa Poly-V Gates', brandCode: 'GAT', brandName: 'GATES', priceList: 15300, stock: { GUA: 5, DEP: 9 } },
      { articleCode: '10005-2', particularCode: '6PK1740D', description: 'Correa Poly-V Dayco', brandCode: 'DAY', brandName: 'DAYCO', priceList: 13800, stock: { GUA: 7, DEP: 0 } },
    ],
  },
  {
    articleCode: '10006',
    description: 'KIT DE EMBRAGUE',
    details: ['KIT DE EMBRAGUE', 'PLACA + DISCO + RULEMAN', 'DIAMETRO 275 MM'],
    compatibleModels: [
      { brandName: 'FORD', model: 'RANGER 3.0 TDI', since: '2005', until: '2012' },
    ],
    alternatives: [
      { articleCode: '10006-1', particularCode: '828 046', description: 'Kit de embrague Valeo', brandCode: 'VAL', brandName: 'VALEO', priceList: 312000, stock: { GUA: 1, DEP: 2 } },
      { articleCode: '10006-2', particularCode: '627 3135 00', description: 'Kit de embrague LUK', brandCode: 'LUK', brandName: 'LUK', priceList: 345000, stock: { GUA: 0, DEP: 1 } },
      { articleCode: '10006-3', particularCode: '3000 951 072', description: 'Kit de embrague Sachs', brandCode: 'SAC', brandName: 'SACHS', priceList: 358900, stock: { GUA: 0, DEP: 0 } },
    ],
  },
  {
    articleCode: '10007',
    description: 'FILTRO DE AIRE',
    details: ['FILTRO DE AIRE', 'PANEL 300 X 255 MM'],
    compatibleModels: [
      { brandName: 'TOYOTA', model: 'HILUX 2.5 / 3.0', since: '2005', until: '2015' },
      { brandName: 'TOYOTA', model: 'SW4 3.0', since: '2005', until: '2015' },
    ],
    alternatives: [
      { articleCode: '10007-1', particularCode: 'C 30 006', description: 'Filtro de aire Mann', brandCode: 'MAN', brandName: 'MANN', priceList: 21500, stock: { GUA: 9, DEP: 14 } },
      { articleCode: '10007-2', particularCode: 'CA10171', description: 'Filtro de aire Fram', brandCode: 'FRM', brandName: 'FRAM', priceList: 17900, stock: { GUA: 3, DEP: 5 } },
      { articleCode: '10007-3', particularCode: 'JFA-0218', description: 'Filtro de aire Wega', brandCode: 'WEG', brandName: 'WEGA', priceList: 12400, stock: { GUA: 11, DEP: 20 } },
    ],
  },
  {
    articleCode: '10008',
    description: 'DISCO DE FRENO DELANTERO',
    details: ['DISCO DE FRENO DELANTERO', 'VENTILADO', 'DIAMETRO 257 MM / ESPESOR 22 MM', 'SE VENDE POR UNIDAD'],
    compatibleModels: [
      { brandName: 'FIAT', model: 'CRONOS 1.3', since: '2018' },
      { brandName: 'FIAT', model: 'ARGO 1.3', since: '2018' },
      { brandName: 'FIAT', model: 'PALIO', since: '2012', until: '2017' },
    ],
    alternatives: [
      { articleCode: '10008-1', particularCode: 'BD 4862', description: 'Disco de freno Fremax', brandCode: 'FRX', brandName: 'FREMAX', priceList: 42800, stock: { GUA: 4, DEP: 8 } },
      { articleCode: '10008-2', particularCode: 'HF 215', description: 'Disco de freno Hipper Freios', brandCode: 'HIP', brandName: 'HIPPER FREIOS', priceList: 36900, stock: { GUA: 2, DEP: 2 } },
      { articleCode: '10008-3', particularCode: 'DF-1105', description: 'Disco de freno Corven', brandCode: 'COR', brandName: 'CORVEN', priceList: 31200, stock: { GUA: 0, DEP: 6 }, isOutlet: true },
    ],
  },
  {
    articleCode: '10009',
    description: 'BOMBA DE AGUA',
    details: ['BOMBA DE AGUA', 'MOTOR 1.9 DIESEL DW8'],
    compatibleModels: [
      { brandName: 'PEUGEOT', model: 'PARTNER 1.9 D', since: '1998', until: '2012' },
      { brandName: 'CITROEN', model: 'BERLINGO 1.9 D', since: '1998', until: '2012' },
    ],
    alternatives: [
      { articleCode: '10009-1', particularCode: 'C-129', description: 'Bomba de agua Dolz', brandCode: 'DOL', brandName: 'DOLZ', priceList: 58700, stock: { GUA: 2, DEP: 3 } },
      { articleCode: '10009-2', particularCode: 'VKPC 83640', description: 'Bomba de agua SKF', brandCode: 'SKF', brandName: 'SKF', priceList: 71300, stock: { GUA: 1, DEP: 0 } },
    ],
  },
  {
    articleCode: '10010',
    description: 'BATERIA 12X75',
    details: ['BATERIA 12X75', 'BORNE POSITIVO DERECHO', 'CAJA 75 AH'],
    compatibleModels: [
      { brandName: 'UNIVERSAL', model: 'NAFTA / DIESEL' },
    ],
    alternatives: [
      { articleCode: '10010-1', particularCode: 'M28KD', description: 'Batería Moura 12x75', brandCode: 'MOU', brandName: 'MOURA', priceList: 189000, stock: { GUA: 6, DEP: 10 } },
      { articleCode: '10010-2', particularCode: 'UB 740', description: 'Batería Willard 12x75', brandCode: 'WIL', brandName: 'WILLARD', priceList: 172500, stock: { GUA: 3, DEP: 4 } },
      { articleCode: '10010-3', particularCode: 'S4 75D', description: 'Batería Bosch 12x75', brandCode: 'BOS', brandName: 'BOSCH', priceList: 198000, stock: { GUA: 0, DEP: 0 } },
    ],
  },
  {
    articleCode: '10011',
    description: 'RULEMAN RUEDA TRASERA',
    details: ['RULEMAN RUEDA TRASERA', 'MEDIDA 30 X 60 X 37 MM'],
    compatibleModels: [
      { brandName: 'VOLKSWAGEN', model: 'GOL', since: '1995', until: '2013' },
      { brandName: 'VOLKSWAGEN', model: 'SAVEIRO', since: '1997', until: '2013' },
    ],
    alternatives: [
      { articleCode: '10011-1', particularCode: 'VKBA 3534', description: 'Ruleman rueda trasera SKF', brandCode: 'SKF', brandName: 'SKF', priceList: 26400, stock: { GUA: 10, DEP: 15 } },
      { articleCode: '10011-2', particularCode: '713 6104 50', description: 'Ruleman rueda trasera FAG', brandCode: 'FAG', brandName: 'FAG', priceList: 28900, stock: { GUA: 2, DEP: 7 } },
    ],
  },
  {
    articleCode: '10012',
    description: 'LAMPARA H4 12V 60/55W',
    details: ['LAMPARA H4 12V 60/55W', 'BASE P43T'],
    compatibleModels: [
      { brandName: 'UNIVERSAL', model: 'FARO PRINCIPAL' },
    ],
    alternatives: [
      { articleCode: '10012-1', particularCode: '64193', description: 'Lámpara H4 Osram', brandCode: 'OSR', brandName: 'OSRAM', priceList: 6100, stock: { GUA: 30, DEP: 80 } },
      { articleCode: '10012-2', particularCode: '12342PR', description: 'Lámpara H4 Philips', brandCode: 'PHI', brandName: 'PHILIPS', priceList: 6800, stock: { GUA: 18, DEP: 36 } },
    ],
  },
]
