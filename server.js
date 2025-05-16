// basic boilerplate for a express server
import express from 'express';

import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

import path from 'path';
import xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';


import { parseExcelDate } from './utils.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));





const app = express();
const port = process.env.PORT || 3001;

let prisma;
try {
    prisma = new PrismaClient();
} catch (error) {
    console.error('Error initializing Prisma Client:', error);
    process.exit(1); // Exit the process if Prisma Client fails to initialize
}


app.get("/", (req, res) => {
    res.send("API is running");
});

app.get("/stock-valuation", async (req, res) => {
    try {
        // Step 1: Check if file exists
        const filePath = './uploads/stockValuation.xlsx'; // Adjust the path if needed
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Step 2: Read Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
        const sheet = workbook.Sheets[sheetName];

        // Step 3: Extract the required data
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length < 4) {
            return res.status(400).json({ message: 'Invalid file format' });
        }

        // Extract date from the first row, first column
        const rawDate = data[0][0]; // First row, first column
        const parsedDate = parseExcelDate(rawDate);

        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: 'Invalid date format in Excel' });
        }

        console.log('📅 Extracted Date:', parsedDate);

        // Step 4: Find the matching TimeRecord in Prisma
        let timeRecord = await prisma.timeRecord.findUnique({
            where: {
                time: parsedDate,
            },
        });

        // If no matching TimeRecord is found, create a new one
        if (!timeRecord) {
            timeRecord = await prisma.timeRecord.create({
                data: {
                    time: parsedDate,
                },
            });

            console.log('🆔 Created new TimeRecord ID:', timeRecord.id);
        } else {
            console.log('🆔 Found existing TimeRecord ID:', timeRecord.id);
        }

        // Step 5: Extract required values
        const extractedData = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            hdpeGranules: {
                qty: data[3] && data[3][0] ? data[3][0] : 0,
                value: data[3] && data[3][2] ? data[3][2] : 0,
            },
            masterBatches: {
                qty: data[4] && data[4][0] ? data[4][0] : 0,
                value: data[4] && data[4][2] ? data[4][2] : 0,
            },
            colourPigments: {
                qty: data[5] && data[5][0] ? data[5][0] : 0,
                value: data[5] && data[5][2] ? data[5][2] : 0,
            },
            totalRawMaterial: {
                qty: data[6] && data[6][0] ? data[6][0] : 0,
                value: data[6] && data[6][2] ? data[6][2] : 0,
            },
            hdpe_tape_factory: {
                qty: data[8] && data[8][0] ? data[8][0] : 0,
                value: data[8] && data[8][2] ? data[8][2] : 0,
            },
            hdpe_tape_job_work: {
                qty: data[9] && data[9][0] ? data[9][0] : 0,
                value: data[9] && data[9][2] ? data[9][2] : 0,
            },
            total_work_in_progress: {
                qty: data[10] && data[10][0] ? data[10][0] : 0,
                value: data[10] && data[10][2] ? data[10][2] : 0,
            },
            hdpe_fishnet_fabrics: {
                qty: data[12] && data[12][0] ? data[12][0] : 0,
                value: data[12] && data[12][2] ? data[12][2] : 0,
            },
            shadenet_fabrics_weed_mat: {
                qty: data[13] && data[13][0] ? data[13][0] : 0,
                value: data[13] && data[13][2] ? data[13][2] : 0,
            },
            pp_fabric_sacks: {
                qty: data[14] && data[14][0] ? data[14][0] : 0,
                value: data[14] && data[14][2] ? data[14][2] : 0,
            },
            total_finished_goods: {
                qty: data[15] && data[15][0] ? data[15][0] : 0,
                value: data[15] && data[15][2] ? data[15][2] : 0,
            },
            packing_material: {
                qty: data[17] && data[17][0] ? data[17][0] : 0,
                value: data[17] && data[17][2] ? data[17][2] : 0,
            },
            seconds: {
                qty: data[18] && data[18][0] ? data[18][0] : 0,
                value: data[18] && data[18][2] ? data[18][2] : 0,
            },
            total_consumables: {
                qty: data[19] && data[19][0] ? data[19][0] : 0,
                value: data[19] && data[19][2] ? data[19][2] : 0,
            },
        };

        console.log('📊 Extracted Data:', extractedData);

        // Step 6: Insert data into StockValuation for each material type
        for (const [key, value] of Object.entries(extractedData)) {
            if (key !== "time_id") {
                await prisma.stockValuation.upsert({
                    where: {
                        time_id_material_type: {  // Composite unique key
                            time_id: timeRecord.id,
                            material_type: key,
                        },
                    },
                    update: {
                        qty: value.qty,      // Update qty if record exists
                        value: value.value,  // Update value if record exists
                    },
                    create: {
                        time_id: timeRecord.id,  // Create with time_id
                        material_type: key,      // Create with material_type
                        qty: value.qty,          // Initial qty
                        value: value.value,      // Initial value
                    },
                });
            }
        }

        return res.json({ message: 'Data extracted and added successfully', data: extractedData });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get("/qty-analysis", async (req, res) => {
    try {
        // Step 1: Check if file exists
        const filePath = './uploads/qty_analysis.xlsx'; // Adjust the path if needed
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Step 2: Read Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
        const sheet = workbook.Sheets[sheetName];

        // Step 3: Extract the required data
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length < 4) {
            return res.status(400).json({ message: 'Invalid file format' });
        }

        // Extract date from the first row, first column
        const rawDate = data[0][1]; // First row, first column
        const parsedDate = parseExcelDate(rawDate);

        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: 'Invalid date format in Excel' });
        }

        console.log('📅 Extracted Date:', parsedDate);

        // Step 4: Find the matching TimeRecord in Prisma
        let timeRecord = await prisma.timeRecord.findUnique({
            where: {
                time: parsedDate,
            },
        });

        // If no matching TimeRecord is found, create a new one
        if (!timeRecord) {
            timeRecord = await prisma.timeRecord.create({
                data: {
                    time: parsedDate,
                },
            });

            console.log('🆔 Created new TimeRecord ID:', timeRecord.id);
        } else {
            console.log('🆔 Found existing TimeRecord ID:', timeRecord.id);
        }

        // Step 5: Extract required values
        const HDPEStockQtyAnalysisData = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            openingStock: data[2] && data[2][1] ? data[2][1] : 0,
            purchases: data[3] && data[3][1] ? data[3][1] : 0,
            jobWorkReceipts: data[4] && data[4][1] ? data[4][1] : 0,
            purchaseReturn: data[5] && data[5][1] ? data[5][1] : 0,
            consumptionMonofil: data[6] && data[6][1] ? data[6][1] : 0,
            consumptionShadeNet: data[7] && data[7][1] ? data[7][1] : 0,
            consumptionPPFabric: data[8] && data[8][1] ? data[8][1] : 0,
            sales: data[10] && data[10][1] ? data[10][1] : 0,
            closingStock: data[11] && data[11][1] ? data[11][1] : 0,
        };

        await prisma.hDPEStockQtyAnalysis.upsert({
            where: { time_id: HDPEStockQtyAnalysisData.time_id },
            update: HDPEStockQtyAnalysisData,
            create: HDPEStockQtyAnalysisData,
        });

        console.log('📊 Extracted HDPEStockQtyAnalysis Data:', HDPEStockQtyAnalysisData);

        const MBStockQtyAnalysis = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            openingStock: data[13] && data[13][1] ? data[13][1] : 0,
            purchases: data[14] && data[14][1] ? data[14][1] : 0,
            purchaseReturn: data[15] && data[15][1] ? data[15][1] : 0,
            consumptionMonofil: data[16] && data[16][1] ? data[16][1] : 0,
            consumptionShadeNet: data[17] && data[17][1] ? data[17][1] : 0,
            consumptionPPFabricSales: data[18] && data[18][1] ? data[18][1] : 0,
            consumption: data[19] && data[19][1] ? data[19][1] : 0,
            sales: data[20] && data[20][1] ? data[20][1] : 0,
            closingStock: data[21] && data[21][1] ? data[21][1] : 0,
        };

        await prisma.mBStockQtyAnalysis.upsert({
            where: { time_id: MBStockQtyAnalysis.time_id },
            update: MBStockQtyAnalysis,
            create: MBStockQtyAnalysis,
        });

        console.log('📊 Extracted MBStockQtyAnalysis Data:', MBStockQtyAnalysis);

        const CPStockData = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            openingStock: data[23] && data[23][1] ? data[23][1] : 0,
            purchases: data[24] && data[24][1] ? data[24][1] : 0,
            purchaseReturn: data[25] && data[25][1] ? data[25][1] : 0,
            consumptionMonofil: data[26] && data[26][1] ? data[26][1] : 0,
            consumptionShadeNet: data[27] && data[27][1] ? data[27][1] : 0,
            consumptionPPFabric: data[28] && data[28][1] ? data[28][1] : 0,
            consumption: data[29] && data[29][1] ? data[29][1] : 0,
            closingStock: data[30] && data[30][1] ? data[30][1] : 0,
        };

        await prisma.CPStock.upsert({
            where: { time_id: CPStockData.time_id },
            update: CPStockData,
            create: CPStockData,
        });

        console.log('📊 Extracted CPStock Data:', CPStockData);

        const WastageComputationData = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            consumptionMonofil: data[34] && data[34][1] ? data[34][1] : 0,
            consumptionShadeNet: data[35] && data[35][1] ? data[35][1] : 0,
            consumptionPPFabric: data[36] && data[36][1] ? data[36][1] : 0,
            hdpeMonofilament: data[39] && data[39][1] ? data[39][1] : 0,
            hdpeMonofilamentSec: data[40] && data[40][1] ? data[40][1] : 0,
            packingMaterials: data[41] && data[41][1] ? data[41][1] : 0,
            totalProduction: data[42] && data[42][1] ? data[42][1] : 0,
            wastage: data[43] && data[43][1] ? data[43][1] : 0,
            wastagePercentage: data[44] && data[44][1] ? data[44][1] * 100 : 0,
        }

        await prisma.wastageComputationQtyAnalysis.upsert({
            where: { time_id: WastageComputationData.time_id },
            update: WastageComputationData,
            create: WastageComputationData,
        });

        console.log("Extracted WastageComputation Data: ", WastageComputationData);

        const HDPEMonofilamentFactoryData = {
            time_id: timeRecord.id,
            openingBalance: data[47] && data[47][1] ? data[47][1] : 0,
            production: data[48] && data[48][1] ? data[48][1] : 0,
            jobWorkProduction: data[49] && data[49][1] ? data[49][1] : 0,
            rf: data[50] && data[50][1] ? data[50][1] : 0,
            total: data[51] && data[51][1] ? data[51][1] : 0,
            consumption: data[52] && data[52][1] ? data[52][1] : 0,
            sales: data[53] && data[53][1] ? data[53][1] : 0,
            jobWork: data[54] && data[54][1] ? data[54][1] : 0,
            totalConsumption: data[55] && data[55][1] ? data[55][1] : 0,
            closingBalance: data[56] && data[56][1] ? data[56][1] : 0
        }

        await prisma.hDPEMonofilamentFactoryQtyAnalysis.upsert({
            where: { time_id: HDPEMonofilamentFactoryData.time_id },
            update: HDPEMonofilamentFactoryData,
            create: HDPEMonofilamentFactoryData,
        });

        console.log("Extracted HDPEMonofilamentFactory Data: ", HDPEMonofilamentFactoryData);

        const HDPEMonofilamentFabricatorData = {
            time_id: timeRecord.id,
            openingBalance: data[58] && data[58][1] ? data[58][1] : 0,
            hdpeMonofilamentReceipt: data[59] && data[59][1] ? data[59][1] : 0,
            total: data[60] && data[60][1] ? data[60][1] : 0,
            hdpeWovenFabrics: data[62] && data[62][1] ? data[62][1] : 0,
            hdpeWovenFabricsRF: data[63] && data[63][1] ? data[63][1] : 0,
            hdpeWovenFabricsSec: data[64] && data[64][1] ? data[64][1] : 0,
            waste: data[65] && data[65][1] ? data[65][1] : 0,
            ropeHanks: data[66] && data[66][1] ? data[66][1] : 0,
            totalProcessed: data[67] && data[67][1] ? data[67][1] : 0,
            wastePercentage: data[68] && data[68][1] ? data[68][1] * 100 : 0,
            closingBalance: data[69] && data[69][1] ? data[69][1] : 0
        }

        await prisma.hDPEMonofilamentFabricatorQtyAnalysis.upsert({
            where: { time_id: HDPEMonofilamentFabricatorData.time_id },
            update: HDPEMonofilamentFabricatorData,
            create: HDPEMonofilamentFabricatorData,
        });

        console.log("Extracted HDPEMonofilamentFabricator Data: ", HDPEMonofilamentFabricatorData);

        const HDPEWovenFabircData = {
            time_id: timeRecord.id,
            openingBalance: data[74] && data[74][1] ? data[74][1] : 0,
            production: data[75] && data[75][1] ? data[75][1] : 0,
            purchases: data[76] && data[76][1] ? data[76][1] : 0,
            productionJWSalesReturn: data[77] && data[77][1] ? data[77][1] : 0,
            sales: data[78] && data[78][1] ? data[78][1] : 0,
            stockTransferSales: data[79] && data[79][1] ? data[79][1] : 0,
            jwIssues: data[80] && data[80][1] ? data[80][1] : 0,
            samplesAndCutPieces: data[81] && data[81][1] ? data[81][1] : 0,
            closingBalance: data[82] && data[82][1] ? data[82][1] : 0
        }

        await prisma.hDPEWovenFabricQtyAnalysis.upsert({
            where: { time_id: HDPEWovenFabircData.time_id },
            update: HDPEWovenFabircData,
            create: HDPEWovenFabircData,
        });

        console.log("Extracted HDPEWovenFabirc Data: ", HDPEWovenFabircData);

        const ShadeNetsTradingData = {
            time_id: timeRecord.id,
            openingBalance: data[84] && data[84][1] ? data[84][1] : 0,
            receiptsTapeShadePurchase: data[85] && data[85][1] ? data[85][1] : 0,
            receiptsTSNJobWork: data[86] && data[86][1] ? data[86][1] : 0,
            receiptsMonoShade: data[87] && data[87][1] ? data[87][1] : 0,
            receiptsWeedMat: data[88] && data[88][1] ? data[88][1] : 0,
            receiptsMulch: data[89] && data[89][1] ? data[89][1] : 0,
            receiptsPPFabric: data[90] && data[90][1] ? data[90][1] : 0,
            receiptsPPSacks: data[91] && data[91][1] ? data[91][1] : 0,
            totalReceipts: data[92] && data[92][1] ? data[92][1] : 0,
            buringLoss: data[93] && data[93][1] ? data[93][1] : 0,
            salesMSN: data[94] && data[94][1] ? data[94][1] : 0,
            salesTSN: data[95] && data[95][1] ? data[95][1] : 0,
            salesWeedMat: data[96] && data[96][1] ? data[96][1] : 0,
            salesMulch: data[97] && data[97][1] ? data[97][1] : 0,
            salesPPFabric: data[98] && data[98][1] ? data[98][1] : 0,
            salesPPSacks: data[99] && data[99][1] ? data[99][1] : 0,
            salesTotal: data[100] && data[100][1] ? data[100][1] : 0,
            closingBalance: data[101] && data[101][1] ? data[101][1] : 0
        }

        await prisma.shadeNetsTradingQtyAnalysis.upsert({
            where: { time_id: ShadeNetsTradingData.time_id },
            update: ShadeNetsTradingData,
            create: ShadeNetsTradingData,
        });

        console.log("Extracted ShadeNetsTrading Data: ", ShadeNetsTradingData);

        const wasteQtyAnalysis = {
            time_id: timeRecord.id,
            openingBalance: data[105] && data[105][1] ? data[105][1] : 0,
            receipts: data[106] && data[106][1] ? data[106][1] : 0,
            issuedForProcessing: data[107] && data[107][1] ? data[107][1] : 0,
            buringLoss: data[108] && data[108][1] ? data[108][1] : 0,
            sales: data[109] && data[109][1] ? data[109][1] : 0,
            closingBalance: data[110] && data[110][1] ? data[110][1] : 0
        }

        await prisma.wasteQtyAnalysis.upsert({
            where: { time_id: wasteQtyAnalysis.time_id },
            update: wasteQtyAnalysis,
            create: wasteQtyAnalysis,
        });

        console.log("Extracted wasteQtyAnalysis Data: ", wasteQtyAnalysis);

        const consolidatedStockQtyAnalysis = {
            time_id: timeRecord.id,
            openingStock: data[112] && data[112][1] ? data[112][1] : 0,
            purchases: data[113] && data[113][1] ? data[113][1] : 0,
            totalStock: data[114] && data[114][1] ? data[114][1] : 0,
            closingStock: data[115] && data[115][1] ? data[115][1] : 0,
            consumption: data[116] && data[116][1] ? data[116][1] : 0,
            sales: data[117] && data[117][1] ? data[117][1] : 0,
            waste: data[118] && data[118][1] ? data[118][1] : 0,
            wastePercentage: data[119] && data[119][1] ? data[119][1] * 100 : 0,
        }

        await prisma.ConsolidatedQtyAnalysis.upsert({
            where: { time_id: consolidatedStockQtyAnalysis.time_id },
            update: consolidatedStockQtyAnalysis,
            create: consolidatedStockQtyAnalysis,
        });

        console.log("Extracted consolidatedStockQtyAnalysis Data: ", consolidatedStockQtyAnalysis);

        const RMSFGseperated = {
            time_id: timeRecord.id,
            openingStockRM: data[121] && data[121][1] ? data[121][1] : 0,
            purchases: data[122] && data[122][1] ? data[122][1] : 0,
            totalStock: data[123] && data[123][1] ? data[123][1] : 0,
            closingStockRM: data[124] && data[124][1] ? data[124][1] : 0,
            saleFromRM: data[125] && data[125][1] ? data[125][1] : 0,
            saleFromSFGFG: data[126] && data[126][1] ? data[126][1] : 0,
            saleAndWasteConsumption: data[127] && data[127][1] ? data[127][1] : 0,
            sales: data[128] && data[128][1] ? data[128][1] : 0,
            waste: data[129] && data[129][1] ? data[129][1] : 0,
            wastePercentage: data[130] && data[130][1] ? data[130][1] * 100 : 0,
        }

        await prisma.rMSFGFGSeparatedQtyAnalysis.upsert({
            where: { time_id: RMSFGseperated.time_id },
            update: RMSFGseperated,
            create: RMSFGseperated,
        });

        console.log("Extracted RMSFGseperated Data: ", RMSFGseperated);

        return res.json({ message: 'Data extracted and added successfully for qty analysis' });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get("/purchase", async (req, res) => {
    try {
        // Step 1: Check if file exists
        const filePath = './uploads/purchase.xlsx'; // Adjust the path if needed
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }
        // Step 2: Read Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
        const sheet = workbook.Sheets[sheetName];

        // Step 3: Extract the required data
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length < 3) {
            return res.status(400).json({ message: 'Invalid file format' });
        }

        // Extract date from the first row, first column
        const rawDate = data[2][0]; // First row, first column
        console.log("📅 Raw Date:", rawDate);
        const parsedDate = parseExcelDate(rawDate);


        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: 'Invalid date format in Excel' });
        }

        console.log('📅 Extracted Date:', parsedDate);

        // Step 4: Find the matching TimeRecord in Prisma
        let timeRecord = await prisma.timeRecord.findUnique({
            where: {
                time: parsedDate,
            },
        });

        // If no matching TimeRecord is found, create a new one
        if (!timeRecord) {
            timeRecord = await prisma.timeRecord.create({
                data: {
                    time: parsedDate,
                },
            });

            console.log('🆔 Created new TimeRecord ID:', timeRecord.id);
        } else {
            console.log('🆔 Found existing TimeRecord ID:', timeRecord.id);
        }

        // Step 5: Extract required values
        const hdpePurchaseData = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][1] ? data[2][1] : 0,
            value: data[2] && data[2][2] ? data[2][2] : 0,
        };

        await prisma.hdpePurchase.upsert({
            where: { time_id: hdpePurchaseData.time_id },
            update: hdpePurchaseData,
            create: hdpePurchaseData,
        });

        console.log('📊 Extracted HDPEPurchase Data:', hdpePurchaseData);

        const MBPurchase = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][4] ? data[2][4] : 0,
            value: data[2] && data[2][5] ? data[2][5] : 0,
        };

        await prisma.mBPurchase.upsert({
            where: { time_id: MBPurchase.time_id },
            update: MBPurchase,
            create: MBPurchase,
        });

        console.log('📊 Extracted MBPurchase Data:', MBPurchase);

        const CPPurchase = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][7] ? data[2][7] : 0,
            value: data[2] && data[2][8] ? data[2][8] : 0,
        };

        await prisma.cPPurchase.upsert({
            where: { time_id: CPPurchase.time_id },
            update: CPPurchase,
            create: CPPurchase,
        });

        console.log('📊 Extracted CPPurchase Data:', CPPurchase);

        const ConsumablesPurchase = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            value: data[2] && data[2][14] ? data[2][14] : 0,
            discount: data[2] && data[2][13] ? data[2][13] : 0,
        };

        await prisma.consumablesPurchase.upsert({
            where: { time_id: ConsumablesPurchase.time_id },
            update: ConsumablesPurchase,
            create: ConsumablesPurchase,
        });

        console.log('📊 Extracted ConsumablesPurchase Data:', ConsumablesPurchase);

        const TSNPurchase = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][16] ? data[2][16] : 0,
            value: data[2] && data[2][17] ? data[2][17] : 0,
        };

        await prisma.tSNPurchase.upsert({
            where: { time_id: TSNPurchase.time_id },
            update: TSNPurchase,
            create: TSNPurchase,
        });

        console.log('📊 Extracted TSNPurchase Data:', TSNPurchase);

        const MSNPurchase = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][19] ? data[2][19] : 0,
            value: data[2] && data[2][20] ? data[2][20] : 0,
        };

        await prisma.mSNPurchase.upsert({
            where: { time_id: MSNPurchase.time_id },
            update: MSNPurchase,
            create: MSNPurchase,
        });

        console.log('📊 Extracted MSNPurchase Data:', MSNPurchase);

        const PPSPurchase = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][22] ? data[2][22] : 0,
            value: data[2] && data[2][23] ? data[2][23] : 0,
        };

        await prisma.pPSPurchase.upsert({
            where: { time_id: PPSPurchase.time_id },
            update: PPSPurchase,
            create: PPSPurchase,
        });

        console.log('📊 Extracted PPSPurchase Data:', PPSPurchase);

        const TotalPurchase = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][25] ? data[2][25] : 0,
            value: data[2] && data[2][26] ? data[2][26] : 0,
        };

        await prisma.totalPurchase.upsert({
            where: { time_id: TotalPurchase.time_id },
            update: TotalPurchase,
            create: TotalPurchase,
        });

        console.log('📊 Extracted TotalPurchase Data:', TotalPurchase);

        const SravyaOthersData = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][28] ? data[2][28] : 0,
            value: data[2] && data[2][29] ? data[2][29] : 0,
        };

        await prisma.sravyaOthersPurchase.upsert({
            where: { time_id: SravyaOthersData.time_id },
            update: SravyaOthersData,
            create: SravyaOthersData,
        });

        console.log('📊 Extracted SravyaOthers Data:', SravyaOthersData);

        const YarnPurchase = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][31] ? data[2][31] : 0,
            value: data[2] && data[2][32] ? data[2][32] : 0,
        };

        await prisma.yarnPurchase.upsert({
            where: { time_id: YarnPurchase.time_id },
            update: YarnPurchase,
            create: YarnPurchase,
        });

        console.log('📊 Extracted YarnPurchase Data:', YarnPurchase);

        const TSNRMConsumedData = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][34] ? data[2][34] : 0,
            value: data[2] && data[2][35] ? data[2][35] : 0,
        };

        await prisma.tSNRMConsumedPurchase.upsert({
            where: { time_id: TSNRMConsumedData.time_id },
            update: TSNRMConsumedData,
            create: TSNRMConsumedData,
        });

        console.log('📊 Extracted TSNRMConsumed Data:', TSNRMConsumedData);

        const TSNConsumedData = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][37] ? data[2][37] : 0,
            value: data[2] && data[2][38] ? data[2][38] : 0,
        };

        await prisma.tSNConsumedPurchase.upsert({
            where: { time_id: TSNConsumedData.time_id },
            update: TSNConsumedData,
            create: TSNConsumedData,
        });

        console.log('📊 Extracted TSNConsumed Data:', TSNConsumedData);

        const TSNTotalRMConsumedData = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][40] ? data[2][40] : 0,
            value: data[2] && data[2][41] ? data[2][41] : 0,
        };

        await prisma.tSNTotalRMConsumedPurchase.upsert({
            where: { time_id: TSNTotalRMConsumedData.time_id },
            update: TSNTotalRMConsumedData,
            create: TSNTotalRMConsumedData,
        });

        console.log('📊 Extracted TSNTotalRMConsumed Data:', TSNTotalRMConsumedData);

        const TRDNGPurchaseData = {
            time_id: timeRecord.id, // Corrected to use `timeRecord.id` here
            kgs: data[2] && data[2][43] ? data[2][43] : 0,
            value: data[2] && data[2][44] ? data[2][44] : 0,
        };

        await prisma.tRDNGPurchase.upsert({
            where: { time_id: TRDNGPurchaseData.time_id },
            update: TRDNGPurchaseData,
            create: TRDNGPurchaseData,
        });

        console.log('📊 Extracted TRDNGPurchase Data:', TRDNGPurchaseData);

        return res.send({ message: 'Data extracted and added successfully for purchase' });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get("/inventory-details", async (req, res) => {
    try {
        // Step 1: Check if file exists
        const filePath = './uploads/inventorysales.xlsx'; // Adjust the path if needed
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }
        // Step 2: Read Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
        const sheet = workbook.Sheets[sheetName];

        // Step 3: Extract the required data
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        console.log('lenggth', data.length);

        if (data.length < 3) {
            return res.status(400).json({ message: 'Invalid file format' });
        }

        // Extract date from the first row, first column
        const rawDate = data[0][1]; // First row, first column
        console.log("📅 Raw Date:", rawDate);
        // const parsedDate = parseExcelDate(rawDate);
        const parsedDate = parseExcelDate(rawDate);

        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: 'Invalid date format in Excel' });
        }

        console.log('📅 Extracted Date:', parsedDate)

        // Step 4: Find the matching TimeRecord in Prisma;

        let timeRecord = await prisma.timeRecord.findUnique({
            where: {
                time: parsedDate,
            },
        });

        // If no matching TimeRecord is found, create a new one
        if (!timeRecord) {
            timeRecord = await prisma.timeRecord.create({
                data: {
                    time: parsedDate,
                },
            });

            console.log('🆔 Created new TimeRecord ID:', timeRecord.id);
        } else {
            console.log('🆔 Found existing TimeRecord ID:', timeRecord.id);
        }

        // Step 5: Extract required values
        const inventoryMaterial = []

        const materialTypes = [
            "MCF",
            "WMF",
            "MONOFILAMENT FABRIC INSECT BAGS",
            "MONOFILAMENT FABRIC INSECT NET",
            "MONOFILAMENT FABRIC HAPPA",
            "NWF/Yarn"
        ];

        materialTypes.forEach((material, index) => {
            const row = 3 + index;
            const outward = data[row] && data[row][1] ? data[row][1] : 0;
            const amount = data[row] && data[row][3] ? data[row][3] : 0;

            inventoryMaterial.push({
                time_id: timeRecord.id,
                materialName: material,
                outwardQty: outward,
                amount: amount
            });

            console.log(`📊 Extracted ${material} Data:`, { outward, amount });
        });

        const additionalMaterialTypes = [
            "MSN",
            "TSN",
            "PP Woven Sacks",
            "ANTI BIRD NET / Rope/MULCH/FIBC",
            "Knitted Fabric 8\" Red/60\" D Green",
            "Weed Mat 1.25 Mtrs Black"
        ];

        additionalMaterialTypes.forEach((material, index) => {
            const row = 10 + index;
            const outward = data[row] && data[row][1] ? data[row][1] : 0;
            const amount = data[row] && data[row][3] ? data[row][3] : 0;

            inventoryMaterial.push({
                time_id: timeRecord.id,
                materialName: material,
                outwardQty: outward,
                amount: amount
            });

            console.log(`📊 Extracted ${material} Data:`, { outward, amount });
        });


        const additionalMaterialTypes2 = [
            "Flexible Intermediate Bulk Container",
            "Packing Materials / Old use Batteries",
            "HDPE Monofilament Waste",
            "Sale of Asset Etc",
            "Raw Material"
        ];

        additionalMaterialTypes2.forEach((material, index) => {
            const row = 17 + index;
            const outward = data[row] && data[row][1] ? data[row][1] : 0;
            const amount = data[row] && data[row][3] ? data[row][3] : 0;

            inventoryMaterial.push({
                time_id: timeRecord.id,
                materialName: material,
                outwardQty: outward,
                amount: amount
            });

            console.log(`📊 Extracted ${material} Data:`, { outward, amount });
        });


        for (const item of inventoryMaterial) {
            await prisma.inventoryDetails.upsert({
                where: {
                    time_id_materialName: { // Composite unique key
                        time_id: item.time_id,
                        materialName: item.materialName,
                    },
                },
                update: {
                    outwardQty: item.outwardQty, // Update quantity if record exists
                    amount: item.amount,         // Update amount if record exists
                },
                create: {
                    time_id: item.time_id,       // Create with time_id
                    materialName: item.materialName, // Create with materialName
                    outwardQty: item.outwardQty,     // Initial quantity
                    amount: item.amount,             // Initial amount
                },
            });
        }



        console.log("📊 Extracted Inventory Material Data: ", inventoryMaterial);

        const salesDetails = {
            time_id: timeRecord.id,
            grandTotalValue: data[23] && data[23][3] ? data[23][3] : 0,
            grandTotalOutward: data[23] && data[23][1] ? data[23][1] : 0,
            otherIncome: data[24] && data[24][3] ? data[24][3] : 0,
            grossSales: data[26] && data[26][3] ? data[26][3] : 0,
            tax: data[27] && data[27][3] ? data[27][3] : 0,
            tcs: data[28] && data[28][3] ? data[28][3] : 0,
            discount: data[31] && data[31][3] ? data[31][3] : 0,
            creditNote: data[33] && data[33][3] ? data[33][3] : 0,
            pal1FinalSales: data[35] && data[35][3] ? data[35][3] : 0,
            RMPurchaseForSales: data[38] && data[38][3] ? data[38][3] : 0,
        }

        await prisma.salesDetails.upsert({
            where: { time_id: salesDetails.time_id },
            update: salesDetails,
            create: salesDetails,
        });

        console.log("📊 Extracted Sales Details: ", salesDetails);

        return res.json({ message: 'Data extracted and added successfully for inventory details' });


    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
);

app.get("/direct-expenses", async (req, res) => {
    try {
        // Step 1: Check if file exists
        const filePath = './uploads/expenses.xlsx'; // Adjust the path if needed
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Step 2: Read Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
        const sheet = workbook.Sheets[sheetName];

        // Step 3: Extract the required data
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length < 3) {
            return res.status(400).json({ message: 'Invalid file format' });
        }

        // Extract date from the first row, first column
        const rawDate = data[0][1]; // First row, first column
        const parsedDate = parseExcelDate(rawDate);

        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: 'Invalid date format in Excel' });
        }

        console.log('📅 Extracted Date:', parsedDate);

        // Step 4: Find the matching TimeRecord in Prisma
        let timeRecord = await prisma.timeRecord.findUnique({
            where: {
                time: parsedDate,
            },
        });

        // If no matching TimeRecord is found, create a new one
        if (!timeRecord) {
            timeRecord = await prisma.timeRecord.create({
                data: {
                    time: parsedDate,
                },
            });

            console.log('🆔 Created new TimeRecord ID:', timeRecord.id);
        } else {
            console.log('🆔 Found existing TimeRecord ID:', timeRecord.id);
        }

        // Step 5: Extract required values
        const manufacturingExpensesData = {
            time_id: timeRecord.id,
            employeeRemuneration: data[2] && data[2][1] ? data[2][1] : 0,
            coolieCartage: data[3] && data[3][1] ? data[3][1] : 0,
            depreciation: data[4] && data[4][1] ? data[4][1] : 0,
            fabricationChargesBlore: data[5] && data[5][1] ? data[5][1] : 0,
            fabricationChargesSircilla: data[6] && data[6][1] ? data[6][1] : 0,
            factoryRepair: data[7] && data[7][1] ? data[7][1] : 0,
            forwardingChargesPaid: data[8] && data[8][1] ? data[8][1] : 0,
            freightInwards: data[9] && data[9][1] ? data[9][1] : 0,
            insuranceOnAssets: data[10] && data[10][1] ? data[10][1] : 0,
            itcReversal: data[11] && data[11][1] ? data[11][1] : 0,
            medicalExpenses: data[12] && data[12][1] ? data[12][1] : 0,
            packingMaterial: data[13] && data[13][1] ? data[13][1] : 0,
            electricity: data[14] && data[14][1] ? data[14][1] : 0,
            processingCharges: data[15] && data[15][1] ? data[15][1] : 0,
            rent: data[16] && data[16][1] ? data[16][1] : 0,
            repairAMC: data[17] && data[17][1] ? data[17][1] : 0,
            yarnProcessing: data[18] && data[18][1] ? data[18][1] : 0,
        };

        await prisma.manufacturingExpensesDirectExpenses.upsert({
            where: { time_id: manufacturingExpensesData.time_id },
            update: manufacturingExpensesData,
            create: manufacturingExpensesData,
        });

        console.log('📊 Extracted Manufacturing Expenses Data:', manufacturingExpensesData);

        const extrasManufacturingData = {
            time_id: timeRecord.id,
            manufacturing: data[22] && data[22][1] ? data[22][1] : 0,
            itcReserved: data[23] && data[23][1] ? data[23][1] : 0,
            inHouseFabrication: data[24] && data[24][1] ? data[24][1] : 0,
            fabrication: data[25] && data[25][1] ? data[25][1] : 0,
            directExpenses: data[26] && data[26][1] ? data[26][1] : 0,
            deprecation: data[27] && data[27][1] ? data[27][1] : 0,
            total: data[28] && data[28][1] ? data[28][1] : 0,
            totalFabrication: data[29] && data[29][1] ? data[29][1] : 0,

            inHouseQty: data[31] && data[31][1] ? data[31][1] : 0,
            fabricators: data[32] && data[32][1] ? data[32][1] : 0,
            yarnProcessingQty: data[33] && data[33][1] ? data[33][1] : 0,
            indirect: data[34] && data[34][1] ? data[34][1] : 0,
            totalExpenses: data[35] && data[35][1] ? data[35][1] : 0,
            PnL: data[37] && data[37][1] ? data[37][1] : 0
        }

        await prisma.extrasManaufacturingDirectExpenses.upsert({
            where: { time_id: extrasManufacturingData.time_id },
            update: extrasManufacturingData,
            create: extrasManufacturingData,
        });

        console.log('📊 Extracted Extras Manufacturing Data:', extrasManufacturingData);


        const variableAndDirectData = {
            time_id: timeRecord.id,
            wagesFabric: data[1] && data[1][4] ? data[1][4] : 0,
            wagesInspectionDispatch: data[2] && data[2][4] ? data[2][4] : 0,
            fabricationCharges: data[3] && data[3][4] ? data[3][4] : 0,
            wagesYarn: data[4] && data[4][4] ? data[4][4] : 0,
            yarnProcessingCharges: data[5] && data[5][4] ? data[5][4] : 0,
            freightInward: data[6] && data[6][4] ? data[6][4] : 0,
            powerBill: data[7] && data[7][4] ? data[7][4] : 0,
            rmMachinery: data[8] && data[8][4] ? data[8][4] : 0,
            rmElectricals: data[9] && data[9][4] ? data[9][4] : 0,
            rent: data[10] && data[10][4] ? data[10][4] : 0,
            packingCharges: data[11] && data[11][4] ? data[11][4] : 0,
            misc: data[12] && data[12][4] ? data[12][4] : 0,
            workingCapitalBankCharges: data[14] && data[14][4] ? data[14][4] : 0,
            workingCapitalLc: data[15] && data[15][4] ? data[15][4] : 0,
            workingCapitalOcc: data[16] && data[16][4] ? data[16][4] : 0,
        }

        await prisma.variableAndDirect.upsert({
            where: { time_id: variableAndDirectData.time_id },
            update: variableAndDirectData,
            create: variableAndDirectData,
        });

        console.log('📊 Extracted Variable and Direct Data:', variableAndDirectData);

        const fixedExpensesData = {
            time_id: timeRecord.id,
            employeesWelfareExp: data[21] && data[21][4] ? data[21][4] : 0,
            salariesOffice: data[22] && data[22][4] ? data[22][4] : 0,
            directorsRemuneration: data[23] && data[23][4] ? data[23][4] : 0,
            depreciation: data[24] && data[24][4] ? data[24][4] : 0,
            admnExpns: data[25] && data[25][4] ? data[25][4] : 0,
            sellingExpns: data[26] && data[26][4] ? data[26][4] : 0,
            financeCostIntOnECLGS: data[27] && data[27][4] ? data[27][4] : 0,
            financeCostIntOnDeposits: data[28] && data[28][4] ? data[28][4] : 0
        }

        await prisma.fixedExpenses2.upsert({
            where: { time_id: fixedExpensesData.time_id },
            update: fixedExpensesData,
            create: fixedExpensesData,
        });

        console.log('📊 Extracted Fixed Expenses Data:', fixedExpensesData);

        return res.json({ message: 'Expenses data extracted and added successfully' });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.get("/indirect-expenses", async (req, res) => {
    try {
        // Step 1: Check if file exists
        const filePath = './uploads/indirect-expenses.xlsx';
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Step 2: Read Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Step 3: Extract the required data
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length < 3) {
            return res.status(400).json({ message: 'Invalid file format' });
        }

        // Extract date from the first row, second column
        const rawDate = data[0][1];
        console.log(rawDate);
        const parsedDate = parseExcelDate(rawDate);

        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: 'Invalid date format in Excel' });
        }

        console.log('📅 Extracted Date:', parsedDate);

        // Step 4: Find or create TimeRecord
        let timeRecord = await prisma.timeRecord.findUnique({
            where: { time: parsedDate },
        });

        if (!timeRecord) {
            timeRecord = await prisma.timeRecord.create({
                data: { time: parsedDate },
            });
            console.log('🆔 Created new TimeRecord ID:', timeRecord.id);
        } else {
            console.log('🆔 Found existing TimeRecord ID:', timeRecord.id);
        }

        // Step 5: Extract expenses by section
        const adminExpenses = [];
        const financialExpenses = [];
        const sellingExpenses = [];
        const totals = [];
        let currentSection = '';
        let selling = "Selling Expenses"

        // Start from row 1 (skip the date row)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const type = row[0]; // First column is the type
            const value = row[1]; // Second column is the value


            // Skip empty rows
            if (!type) continue;

            // Check for section headers
            if (type === "Administrative Expenses") {
                currentSection = 'admin';
            } else if (type === "Financial Expenses") {
                currentSection = 'financial';
            } else if (type === selling) {
                console.log(selling)
                currentSection = 'selling';
                selling = "1"
            } else if (type === "Grand Total") {
                currentSection = 'totals';
            } else if (currentSection) {
                // Add expense to the current section
                const expense = {
                    type: type || `Unknown_${i}`,
                    value: value !== undefined && value !== "" ? parseFloat(value) : 0
                };
                if (currentSection === 'admin') adminExpenses.push(expense);
                if (currentSection === 'financial') financialExpenses.push(expense);
                if (currentSection === 'selling') sellingExpenses.push(expense);
                if (currentSection === 'totals') totals.push(expense);
            }
        }

        // Step 6: Save to database using upsert
        // Administrative Expenses
        if (adminExpenses.length > 0) {
            for (const expense of adminExpenses) {
                await prisma.administrativeExpense.upsert({
                    where: {
                        time_id_type_unique: {
                            time_id: timeRecord.id,
                            type: expense.type
                        }
                    },
                    update: {
                        value: expense.value
                    },
                    create: {
                        time_id: timeRecord.id,
                        type: expense.type,
                        value: expense.value
                    }
                });
            }
            console.log('📦 Upserted Administrative Expenses to the database');
        }

        // Financial Expenses
        if (financialExpenses.length > 0) {
            for (const expense of financialExpenses) {
                await prisma.financialExpense.upsert({
                    where: {
                        time_id_type_unique: {
                            time_id: timeRecord.id,
                            type: expense.type
                        }
                    },
                    update: {
                        value: expense.value
                    },
                    create: {
                        time_id: timeRecord.id,
                        type: expense.type,
                        value: expense.value
                    }
                });
            }
            console.log('📦 Upserted Financial Expenses to the database');
        }

        // Selling Expenses
        if (sellingExpenses.length > 0) {
            for (const expense of sellingExpenses) {
                await prisma.sellingExpense.upsert({
                    where: {
                        time_id_type_unique: {
                            time_id: timeRecord.id,
                            type: expense.type
                        }
                    },
                    update: {
                        value: expense.value
                    },
                    create: {
                        time_id: timeRecord.id,
                        type: expense.type,
                        value: expense.value
                    }
                });
            }
            console.log('📦 Upserted Selling Expenses to the database');
        }

        if (totals.length > 0) {
            for (const expense of totals) {
                await prisma.totals.upsert({
                    where: {
                        time_id_type_unique: {
                            time_id: timeRecord.id,
                            type: expense.type
                        }
                    },
                    update: {
                        value: expense.value
                    },
                    create: {
                        time_id: timeRecord.id,
                        type: expense.type,
                        value: expense.value
                    }
                });
            }
        }

        // Step 7: Return the response
        return res.json({
            message: 'Expenses data extracted and added successfully',
        });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});



//output files routes

// app.get("/cogs", async (req, res) => {

//     try {

//         const month = req.query.month

//         const date = parseExcelDate(month);

//         const timeRecord = await prisma.timeRecord.findUnique({
//             where: {
//                 time: date,
//             },
//         });

//         if (!timeRecord) {
//             return res.status(404).json({ message: 'Time record not found for the given date' });
//         }

//         const oneMonthBackRecord = await prisma.timeRecord.findFirst({
//             where: {
//                 time: new Date(date.setMonth(date.getMonth() - 1)),
//             }
//         });

//         if (!oneMonthBackRecord) {
//             return res.status(404).json({ message: 'Time record not found for the previous month' });
//         }



//         const stockValuation = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: oneMonthBackRecord.id,
//             }
//         });


//         const purchaseData = await prisma.hdpePurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });


//         const inventoryDetails = await prisma.inventoryDetails.findMany({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "Raw Material"
//             }
//         });

//         const salesDetails = await prisma.salesDetails.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             }
//         });

//         console.log('📊 Shadenet and PP Fabric:', salesDetails);


//         const purchaseDiscount = await prisma.ConsumablesPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });



//         const stockValuationNext = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: timeRecord.id,
//                 material_type: "hdpeGranules"
//             }
//         });

//         const hdpeCogsData = {
//             openingStock: stockValuation ? stockValuation[0].qty : 0,
//             openingStockValue: stockValuation ? stockValuation[0].value : 0,

//             purchaseQty: purchaseData ? purchaseData.kgs : 0,
//             purchaseValue: purchaseDiscount && purchaseData ? purchaseData.value - purchaseDiscount.discount : 0,

//             // consumables: dont know where to get data from 
//             // purchaseReturn: dont know where to get data from 

//             salesQty: inventoryDetails ? inventoryDetails[0].outwardQty : 0,
//             salesValue: inventoryDetails && salesDetails ? salesDetails.RMPurchaseForSales : 0, // minus some value should be done where to get that value from

//             closingStockQty: stockValuationNext ? stockValuationNext[0].qty : 0,
//             closingStockValue: stockValuationNext ? stockValuationNext[0].value : 0,

//         }

//         console.log('📊 HDPE COGS Data:', hdpeCogsData);


//         const mBStockData = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: oneMonthBackRecord.id,
//                 material_type: "masterBatches"
//             }
//         });

//         const mBPurchaseData = await prisma.mBPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const mBClosingStockData = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: timeRecord.id,
//                 material_type: "masterBatches"
//             }
//         });


//         const mdCogsData = {
//             openingStock: mBStockData ? mBStockData[0].qty : 0,
//             openingStockValue: mBStockData ? mBStockData[0].value : 0, //actual value is different from the db value even in the excel the ref is not there

//             purchaseQty: mBPurchaseData ? mBPurchaseData.kgs : 0,
//             purchaseValue: mBPurchaseData ? mBPurchaseData.value : 0,

//             closingStockQty: mBClosingStockData ? mBClosingStockData[0].qty : 0,
//             closingStockValue: mBClosingStockData ? mBClosingStockData[0].value : 0,
//         }

//         console.log('📊 MD COGS Data:', mdCogsData);

//         const cpOpeningStockData = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: oneMonthBackRecord.id,
//                 material_type: "colourPigments"
//             }
//         });

//         const cpPurchaseData = await prisma.cPPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const cpClosingStockData = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: timeRecord.id,
//                 material_type: "colourPigments"
//             }
//         });

//         const cpCogsData = {

//             openingStock: cpOpeningStockData ? cpOpeningStockData[0].qty : 0,
//             openingStockValue: cpOpeningStockData ? cpOpeningStockData[0].value : 0,

//             purchaseQty: cpPurchaseData ? cpPurchaseData.kgs : 0,
//             purchaseValue: cpPurchaseData ? cpPurchaseData.value : 0,

//             closingStockQty: cpClosingStockData ? cpClosingStockData[0].qty : 0,
//             closingStockValue: cpClosingStockData ? cpClosingStockData[0].value : 0,

//         }

//         console.log('📊 CP COGS Data:', cpCogsData);

//         const rmConsumptionCogsData = {
//             openingStock: (cpCogsData?.openingStock || 0) + (mdCogsData?.openingStock || 0) + (hdpeCogsData?.openingStock || 0),
//             openingStockValue: (cpCogsData?.openingStockValue || 0) + (mdCogsData?.openingStockValue || 0) + (hdpeCogsData?.openingStockValue || 0),

//             purchaseQty: (cpCogsData?.purchaseQty || 0) + (mdCogsData?.purchaseQty || 0) + (hdpeCogsData?.purchaseQty || 0),
//             purchaseValue: (cpCogsData?.purchaseValue || 0) + (mdCogsData?.purchaseValue || 0) + (hdpeCogsData?.purchaseValue || 0),

//             sales: hdpeCogsData?.salesQty || 0,
//             salesValue: hdpeCogsData?.salesValue || 0,

//             closingStock: (cpCogsData?.closingStockQty || 0) + (mdCogsData?.closingStockQty || 0) + (hdpeCogsData?.closingStockQty || 0),
//             closingStockValue: (cpCogsData?.closingStockValue || 0) + (mdCogsData?.closingStockValue || 0) + (hdpeCogsData?.closingStockValue || 0),
//         };

//         console.log('📊 RM Consumption COGS Data:', rmConsumptionCogsData);

//         const yarnPurchaseData = await prisma.yarnPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const sravyaOthersData = await prisma.sravyaOthersPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const consumablesData = await prisma.ConsumablesPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const monofilCogsData = {
//             yarnPurchases: yarnPurchaseData ? yarnPurchaseData.kgs : 0,
//             yarnValue: yarnPurchaseData ? yarnPurchaseData.value : 0,

//             purchaseFabric: sravyaOthersData ? sravyaOthersData.kgs : 0,
//             purchaseFabricValue: sravyaOthersData ? sravyaOthersData.value : 0,

//             consumablesPurchase: consumablesData ? consumablesData.value : 0,
//         }

//         console.log('📊 Monofilament COGS Data:', monofilCogsData);

//         const stockvaluationData = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: oneMonthBackRecord.id,
//                 material_type: "shadenet_fabrics_weed_mat"
//             }
//         });


//         //more data needs to come from tradingPL
//         const tradingConsumptionCogsData = {
//             openingStock: stockvaluationData ? stockvaluationData[0].qty : 0,
//         }

//         console.log('📊 Trading Consumption COGS Data:', tradingConsumptionCogsData);


//         const totalCogsDataCOGS = {
//             openingStock: rmConsumptionCogsData.openingStock || 0,  // + monofilCogsData openingstock
//             openingStockValue: rmConsumptionCogsData.openingStockValue || 0, // + monofilCogsData openingstockvalue  

//             purchaseHD: hdpeCogsData.purchaseQty || 0,
//             purchaseHDValue: hdpeCogsData.purchaseValue || 0,

//             purchaseMD: mdCogsData.purchaseQty || 0,
//             purchaseMDValue: mdCogsData.purchaseValue || 0,

//             purchaseMonofil: monofilCogsData.yarnPurchases || 0,
//             purchaseMonofilValue: monofilCogsData.yarnValue || 0,

//             // purchaseTrading: tradingConsumptionCogsData.openingStock || 0, // need to get data from tradingPL
//             rmSales: rmConsumptionCogsData.sales || 0,
//             rmSalesValue: rmConsumptionCogsData.salesValue || 0,

//             closingStock: rmConsumptionCogsData.closingStock || 0, // + monofilCogsData closingstock
//             closingStockValue: rmConsumptionCogsData.closingStockValue || 0, // + tradingConsumption closingstockvalue  
//         }

//         console.log('📊 Total COGS Data:', totalCogsDataCOGS);

//         const stockVal = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: oneMonthBackRecord.id,
//                 AND: {
//                     material_type: {
//                         in: ["hdpe_tape_factory", "hdpe_tape_job_work"]
//                     }
//                 }
//             }
//         });

//         const stockValFrabric = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: oneMonthBackRecord.id,
//                 material_type: "hdpe_fishnet_fabrics"
//             }
//         });

//         const monofilSFGnFGOpeningStockCOGS = {
//             sfg_yarn: (stockVal[0] ? stockVal[0].qty : 0) + (stockVal[1] ? stockVal[1].qty : 0),
//             sfg_yarn_value: (stockVal[0] ? stockVal[0].value : 0) + (stockVal[1] ? stockVal[1].value : 0),

//             fg_fabric: stockValFrabric ? stockValFrabric[0].qty : 0,
//             fg_fabric_value: stockValFrabric ? stockValFrabric[0].value : 0,
//         }

//         console.log('📊 monofilSFG openingstock', monofilSFGnFGOpeningStockCOGS);

//         const purchaseYarn = await prisma.yarnPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const monofilSFGnFGPurchaseCOGS = {

//             sfg_yarn: purchaseYarn ? purchaseYarn.kgs : 0,
//             sfg_yarn_value: purchaseYarn ? purchaseYarn.value : 0,

//             fg_fabric: sravyaOthersData ? sravyaOthersData.kgs : 0,
//             fg_fabric_value: sravyaOthersData ? sravyaOthersData.value : 0,

//             consumables: consumablesData ? consumablesData.value : 0,
//         }

//         console.log('📊 monofilSFG purchase', monofilSFGnFGPurchaseCOGS);

//         const stockValClosing = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: timeRecord.id,
//                 AND: {
//                     material_type: {
//                         in: ["hdpe_tape_factory", "hdpe_tape_job_work"]
//                     }
//                 }
//             }
//         });

//         const stockValFrabricClosing = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: timeRecord.id,
//                 material_type: "hdpe_fishnet_fabrics"
//             }
//         });

//         const monogilSFGnFGClosingStockCOGS = {
//             sfg_yarn: (stockValClosing[0] ? stockValClosing[0].qty : 0) + (stockValClosing[1] ? stockValClosing[1].qty : 0),
//             sfg_yarn_value: (stockValClosing[0] ? stockValClosing[0].value : 0) + (stockValClosing[1] ? stockValClosing[1].value : 0),

//             fg_fabric: stockValFrabricClosing ? stockValFrabricClosing[0].qty : 0,
//             fg_fabric_value: stockValFrabricClosing ? stockValFrabricClosing[0].value : 0,
//         }

//         console.log('📊 monofilSFG closingstock', monogilSFGnFGClosingStockCOGS);

//         const stockvalOpening = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: oneMonthBackRecord.id,
//                 material_type: "shadenet_fabrics_weed_mat"
//             }
//         });

//         const stockValClosingStock = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: timeRecord.id,
//                 AND: {
//                     material_type: {
//                         in: ["shadenet_fabrics_weed_mat", "pp_fabric_sacks"]
//                     }
//                 }
//             }
//         });

//         const tradingCOGS = {
//             openingStock: stockvalOpening ? stockvalOpening[0].qty : 0,
//             openingStockValue: stockvalOpening ? stockvalOpening[0].value : 0,

//             closingStock: (stockValClosingStock[0] ? stockValClosingStock[0].qty : 0) + (stockValClosingStock[1] ? stockValClosingStock[1].qty : 0),
//             closingStockValue: (stockValClosingStock[0] ? stockValClosingStock[0].value : 0) + (stockValClosingStock[1] ? stockValClosingStock[1].value : 0),
//         }

//         tradingCOGS.difference_stock = Math.abs(tradingCOGS.openingStock - tradingCOGS.closingStock);
//         tradingCOGS.difference_stock_value = Math.abs(tradingCOGS.openingStockValue - tradingCOGS.closingStockValue);

//         console.log('📊 Trading COGS', tradingCOGS);

//         await prisma.hdpeCogs.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...hdpeCogsData },
//             create: { time_id: timeRecord.id, ...hdpeCogsData },
//         });
//         console.log('📊 HDPE COGS Data upserted:', hdpeCogsData);

//         await prisma.mdCogs.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...mdCogsData },
//             create: { time_id: timeRecord.id, ...mdCogsData },
//         });
//         console.log('📊 MD COGS Data upserted:', mdCogsData);

//         await prisma.cpCogs.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...cpCogsData },
//             create: { time_id: timeRecord.id, ...cpCogsData },
//         });
//         console.log('📊 CP COGS Data upserted:', cpCogsData);

//         await prisma.rmConsumptionCogs.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...rmConsumptionCogsData },
//             create: { time_id: timeRecord.id, ...rmConsumptionCogsData },
//         });
//         console.log('📊 RM Consumption COGS Data upserted:', rmConsumptionCogsData);

//         await prisma.monofilCogs.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...monofilCogsData },
//             create: { time_id: timeRecord.id, ...monofilCogsData },
//         });
//         console.log('📊 Monofilament COGS Data upserted:', monofilCogsData);

//         await prisma.totalCogs.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...totalCogsDataCOGS },
//             create: { time_id: timeRecord.id, ...totalCogsDataCOGS },
//         });
//         console.log('📊 Total COGS Data upserted:', totalCogsDataCOGS);

//         await prisma.monofilSFGnFGOpeningStock.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...monofilSFGnFGOpeningStockCOGS },
//             create: { time_id: timeRecord.id, ...monofilSFGnFGOpeningStockCOGS },
//         });
//         console.log('📊 Monofil SFG Opening Stock upserted:', monofilSFGnFGOpeningStockCOGS);

//         await prisma.monofilSFGnFGPurchase.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...monofilSFGnFGPurchaseCOGS },
//             create: { time_id: timeRecord.id, ...monofilSFGnFGPurchaseCOGS },
//         });
//         console.log('📊 Monofil SFG Purchase upserted:', monofilSFGnFGPurchaseCOGS);

//         await prisma.monofilSFGnFGClosingStock.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...monogilSFGnFGClosingStockCOGS },
//             create: { time_id: timeRecord.id, ...monogilSFGnFGClosingStockCOGS },
//         });
//         console.log('📊 Monofil SFG Closing Stock upserted:', monogilSFGnFGClosingStockCOGS);

//         await prisma.tradingCogs.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...tradingCOGS },
//             create: { time_id: timeRecord.id, ...tradingCOGS },
//         });
//         console.log('📊 Trading COGS upserted:', tradingCOGS);

//         // Create a new workbook and worksheet
//         const wb = xlsx.utils.book_new();
//         const ws = xlsx.utils.json_to_sheet([], { skipHeader: true }); // Start with an empty sheet

//         // Define the header row
//         const monthHeader = req.query.month; // You can dynamically set this based on the `month` query param if needed
//         const headers = [
//             ["Particulars", monthHeader, "", ""], // Empty cells for alignment
//             ["", "Qty", "Rate", "Value"] // Column headers
//         ];

//         // Helper function to calculate rate (value/qty) and handle division by zero
//         const calculateRate = (value, qty) => qty !== 0 ? (value / qty).toFixed(2) : 0;

//         // HDPE COGS Data
//         const hdpeData = [
//             ["HDPE", "", "", ""], // Section header
//             ["Opening Stock", hdpeCogsData.openingStock, calculateRate(hdpeCogsData.openingStockValue, hdpeCogsData.openingStock), hdpeCogsData.openingStockValue],
//             ["Purchase", hdpeCogsData.purchaseQty, calculateRate(hdpeCogsData.purchaseValue, hdpeCogsData.purchaseQty), hdpeCogsData.purchaseValue],
//             ["Sales", hdpeCogsData.salesQty, calculateRate(hdpeCogsData.salesValue, hdpeCogsData.salesQty), hdpeCogsData.salesValue],
//             ["Closing Stock", hdpeCogsData.closingStockQty, calculateRate(hdpeCogsData.closingStockValue, hdpeCogsData.closingStockQty), hdpeCogsData.closingStockValue],
//             ["Consumption HDPE",
//                 hdpeCogsData.openingStock + hdpeCogsData.purchaseQty - (hdpeCogsData.salesQty + hdpeCogsData.closingStockQty),
//                 calculateRate(
//                     hdpeCogsData.openingStockValue + hdpeCogsData.purchaseValue - (hdpeCogsData.salesValue + hdpeCogsData.closingStockValue),
//                     hdpeCogsData.openingStock + hdpeCogsData.purchaseQty - (hdpeCogsData.salesQty + hdpeCogsData.closingStockQty)
//                 ),
//                 hdpeCogsData.openingStockValue + hdpeCogsData.purchaseValue - (hdpeCogsData.salesValue + hdpeCogsData.closingStockValue)
//             ],
//         ];

//         // MD COGS Data
//         const mdData = [
//             ["MD", "", "", ""], // Section header
//             ["Opening Stock", mdCogsData.openingStock, calculateRate(mdCogsData.openingStockValue, mdCogsData.openingStock), mdCogsData.openingStockValue],
//             ["Purchase", mdCogsData.purchaseQty, calculateRate(mdCogsData.purchaseValue, mdCogsData.purchaseQty), mdCogsData.purchaseValue],
//             ["Closing Stock", mdCogsData.closingStockQty, calculateRate(mdCogsData.closingStockValue, mdCogsData.closingStockQty), mdCogsData.closingStockValue]
//         ];

//         // CP COGS Data
//         const cpData = [
//             ["CP", "", "", ""], // Section header
//             ["Opening Stock", cpCogsData.openingStock, calculateRate(cpCogsData.openingStockValue, cpCogsData.openingStock), cpCogsData.openingStockValue],
//             ["Purchase", cpCogsData.purchaseQty, calculateRate(cpCogsData.purchaseValue, cpCogsData.purchaseQty), cpCogsData.purchaseValue],
//             ["Closing Stock", cpCogsData.closingStockQty, calculateRate(cpCogsData.closingStockValue, cpCogsData.closingStockQty), cpCogsData.closingStockValue]
//         ];

//         // RM Consumption COGS Data
//         const rmData = [
//             ["RM Consumption", "", "", ""], // Section header
//             ["Opening Stock", rmConsumptionCogsData.openingStock, calculateRate(rmConsumptionCogsData.openingStockValue, rmConsumptionCogsData.openingStock), rmConsumptionCogsData.openingStockValue],
//             ["Purchase", rmConsumptionCogsData.purchaseQty, calculateRate(rmConsumptionCogsData.purchaseValue, rmConsumptionCogsData.purchaseQty), rmConsumptionCogsData.purchaseValue],
//             ["Sales", rmConsumptionCogsData.sales, calculateRate(rmConsumptionCogsData.salesValue, rmConsumptionCogsData.sales), rmConsumptionCogsData.salesValue],
//             ["Closing Stock", rmConsumptionCogsData.closingStock, calculateRate(rmConsumptionCogsData.closingStockValue, rmConsumptionCogsData.closingStock), rmConsumptionCogsData.closingStockValue]
//         ];

//         // Monofilament COGS Data
//         const monofilData = [
//             ["Monofilament", "", "", ""], // Section header
//             ["Yarn Purchases", monofilCogsData.yarnPurchases, calculateRate(monofilCogsData.yarnValue, monofilCogsData.yarnPurchases), monofilCogsData.yarnValue],
//             ["Purchase Fabric", monofilCogsData.purchaseFabric, calculateRate(monofilCogsData.purchaseFabricValue, monofilCogsData.purchaseFabric), monofilCogsData.purchaseFabricValue],
//             ["Consumables Purchase", "", "", monofilCogsData.consumablesPurchase] // No qty for consumables
//         ];

//         // Total COGS Data
//         const totalCogsData = [
//             ["Total COGS", "", "", ""], // Section header
//             ["Opening Stock", totalCogsDataCOGS.openingStock, calculateRate(totalCogsDataCOGS.openingStockValue, totalCogsDataCOGS.openingStock), totalCogsDataCOGS.openingStockValue],
//             ["Purchase HD", totalCogsDataCOGS.purchaseHD, calculateRate(totalCogsDataCOGS.purchaseHDValue, totalCogsDataCOGS.purchaseHD), totalCogsDataCOGS.purchaseHDValue],
//             ["Purchase MD", totalCogsDataCOGS.purchaseMD, calculateRate(totalCogsDataCOGS.purchaseMDValue, totalCogsDataCOGS.purchaseMD), totalCogsDataCOGS.purchaseMDValue],
//             ["Purchase Monofil", totalCogsDataCOGS.purchaseMonofil, calculateRate(totalCogsDataCOGS.purchaseMonofilValue, totalCogsDataCOGS.purchaseMonofil), totalCogsDataCOGS.purchaseMonofilValue],
//             ["RM Sales", totalCogsDataCOGS.rmSales, calculateRate(totalCogsDataCOGS.rmSalesValue, totalCogsDataCOGS.rmSales), totalCogsDataCOGS.rmSalesValue],
//             ["Closing Stock", totalCogsDataCOGS.closingStock, calculateRate(totalCogsDataCOGS.closingStockValue, totalCogsDataCOGS.closingStock), totalCogsDataCOGS.closingStockValue]
//         ];

//         // Monofil SFG/FG Opening Stock
//         const monofilSFGOpening = [
//             ["Monofil SFG/FG Opening Stock", "", "", ""], // Section header
//             ["SFG Yarn", monofilSFGnFGOpeningStockCOGS.sfg_yarn, calculateRate(monofilSFGnFGOpeningStockCOGS.sfg_yarn_value, monofilSFGnFGOpeningStockCOGS.sfg_yarn), monofilSFGnFGOpeningStockCOGS.sfg_yarn_value],
//             ["FG Fabric", monofilSFGnFGOpeningStockCOGS.fg_fabric, calculateRate(monofilSFGnFGOpeningStockCOGS.fg_fabric_value, monofilSFGnFGOpeningStockCOGS.fg_fabric), monofilSFGnFGOpeningStockCOGS.fg_fabric_value]
//         ];

//         // Monofil SFG/FG Purchase
//         const monofilSFGPurchase = [
//             ["Monofil SFG/FG Purchase", "", "", ""], // Section header
//             ["SFG Yarn", monofilSFGnFGPurchaseCOGS.sfg_yarn, calculateRate(monofilSFGnFGPurchaseCOGS.sfg_yarn_value, monofilSFGnFGPurchaseCOGS.sfg_yarn), monofilSFGnFGPurchaseCOGS.sfg_yarn_value],
//             ["FG Fabric", monofilSFGnFGPurchaseCOGS.fg_fabric, calculateRate(monofilSFGnFGPurchaseCOGS.fg_fabric_value, monofilSFGnFGPurchaseCOGS.fg_fabric), monofilSFGnFGPurchaseCOGS.fg_fabric_value],
//             ["Consumables", "", "", monofilSFGnFGPurchaseCOGS.consumables]
//         ];

//         // Monofil SFG/FG Closing Stock
//         const monofilSFGClosing = [
//             ["Monofil SFG/FG Closing Stock", "", "", ""], // Section header
//             ["SFG Yarn", monogilSFGnFGClosingStockCOGS.sfg_yarn, calculateRate(monogilSFGnFGClosingStockCOGS.sfg_yarn_value, monogilSFGnFGClosingStockCOGS.sfg_yarn), monogilSFGnFGClosingStockCOGS.sfg_yarn_value],
//             ["FG Fabric", monogilSFGnFGClosingStockCOGS.fg_fabric, calculateRate(monogilSFGnFGClosingStockCOGS.fg_fabric_value, monogilSFGnFGClosingStockCOGS.fg_fabric), monogilSFGnFGClosingStockCOGS.fg_fabric_value]
//         ];

//         // Trading COGS
//         const tradingData = [
//             ["Trading COGS", "", "", ""], // Section header
//             ["Opening Stock", tradingCOGS.openingStock, calculateRate(tradingCOGS.openingStockValue, tradingCOGS.openingStock), tradingCOGS.openingStockValue],
//             ["Closing Stock", tradingCOGS.closingStock, calculateRate(tradingCOGS.closingStockValue, tradingCOGS.closingStock), tradingCOGS.closingStockValue],
//             ["Difference Stock", tradingCOGS.difference_stock, calculateRate(tradingCOGS.difference_stock_value, tradingCOGS.difference_stock), tradingCOGS.difference_stock_value]
//         ];

//         // Combine all data with spacing between sections
//         const allData = [
//             ...headers,
//             ...hdpeData, [""], // Empty row for spacing
//             ...mdData, [""],
//             ...cpData, [""],
//             ...rmData, [""],
//             ...monofilData, [""],
//             ...totalCogsData, [""],
//             ...monofilSFGOpening, [""],
//             ...monofilSFGPurchase, [""],
//             ...monofilSFGClosing, [""],
//             ...tradingData
//         ];

//         // Append all data to the worksheet
//         xlsx.utils.sheet_add_aoa(ws, allData, { origin: "A1" });

//         // Set column widths (optional)
//         ws['!cols'] = [
//             { wch: 25 }, // Particulars
//             { wch: 15 }, // Qty
//             { wch: 15 }, // Rate
//             { wch: 15 }  // Value
//         ];

//         // Add the worksheet to the workbook
//         xlsx.utils.book_append_sheet(wb, ws, "COGS");

//         // Write the file
//         const filePath = `./COGS_${monthHeader}.xlsx`;
//         xlsx.writeFile(wb, filePath);

//         console.log(`📊 Excel file generated: ${filePath}`);

//         return res.json({ message: 'COGS data extracted and added successfully' });

//     } catch (error) {
//         console.error('❌ Error:', error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }

// });

app.get("/cogs", async (req, res) => {
    try {
        const month = req.query.month;
        const date = parseExcelDate(month);

        const __dirname = path.dirname(fileURLToPath(import.meta.url));

        const filePath = path.join(__dirname, `COGS.xlsx`); // Fixed file name
        let wb, ws;

        // Check if the file exists
        const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);

        if (fileExists) {
            // Read existing workbook
            wb = xlsx.readFile(filePath);
            ws = wb.Sheets[wb.SheetNames[0]]; // Assume data is in the first sheet
        } else {
            // Create new workbook and worksheet
            wb = xlsx.utils.book_new();
            ws = xlsx.utils.json_to_sheet([], { skipHeader: true });
        }

        // Fetch data from Prisma (same as original code)
        const timeRecord = await prisma.timeRecord.findUnique({
            where: { time: date },
        });

        if (!timeRecord) {
            return res.status(404).json({ message: 'Time record not found for the given date' });
        }

        const oneMonthBackRecord = await prisma.timeRecord.findFirst({
            where: { time: new Date(date.setMonth(date.getMonth() - 1)) },
        });

        if (!oneMonthBackRecord) {
            return res.status(404).json({ message: 'Time record not found for the previous month' });
        }

        const stockValuation = await prisma.stockValuation.findMany({
            where: { time_id: oneMonthBackRecord.id },
        });

        const purchaseData = await prisma.hdpePurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const inventoryDetails = await prisma.inventoryDetails.findMany({
            where: { time_id: timeRecord.id, materialName: "Raw Material" },
        });

        const salesDetails = await prisma.salesDetails.findUnique({
            where: { time_id: timeRecord.id },
        });

        const purchaseDiscount = await prisma.ConsumablesPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const stockValuationNext = await prisma.stockValuation.findMany({
            where: { time_id: timeRecord.id, material_type: "hdpeGranules" },
        });

        const hdpeCogsData = {
            openingStock: stockValuation ? stockValuation[0].qty : 0,
            openingStockValue: stockValuation ? stockValuation[0].value : 0,
            purchaseQty: purchaseData ? purchaseData.kgs : 0,
            purchaseValue: purchaseDiscount && purchaseData ? purchaseData.value - purchaseDiscount.discount : 0,
            salesQty: inventoryDetails ? inventoryDetails[0].outwardQty : 0,
            salesValue: inventoryDetails && salesDetails ? salesDetails.RMPurchaseForSales : 0,
            closingStockQty: stockValuationNext ? stockValuationNext[0].qty : 0,
            closingStockValue: stockValuationNext ? stockValuationNext[0].value : 0,
        };

        const mBStockData = await prisma.stockValuation.findMany({
            where: { time_id: oneMonthBackRecord.id, material_type: "masterBatches" },
        });

        const mBPurchaseData = await prisma.mBPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const mBClosingStockData = await prisma.stockValuation.findMany({
            where: { time_id: timeRecord.id, material_type: "masterBatches" },
        });

        const mdCogsData = {
            openingStock: mBStockData ? mBStockData[0].qty : 0,
            openingStockValue: mBStockData ? mBStockData[0].value : 0,
            purchaseQty: mBPurchaseData ? mBPurchaseData.kgs : 0,
            purchaseValue: mBPurchaseData ? mBPurchaseData.value : 0,
            closingStockQty: mBClosingStockData ? mBClosingStockData[0].qty : 0,
            closingStockValue: mBClosingStockData ? mBClosingStockData[0].value : 0,
        };

        const cpOpeningStockData = await prisma.stockValuation.findMany({
            where: { time_id: oneMonthBackRecord.id, material_type: "colourPigments" },
        });

        const cpPurchaseData = await prisma.cPPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const cpClosingStockData = await prisma.stockValuation.findMany({
            where: { time_id: timeRecord.id, material_type: "colourPigments" },
        });

        const cpCogsData = {
            openingStock: cpOpeningStockData ? cpOpeningStockData[0].qty : 0,
            openingStockValue: cpOpeningStockData ? cpOpeningStockData[0].value : 0,
            purchaseQty: cpPurchaseData ? cpPurchaseData.kgs : 0,
            purchaseValue: cpPurchaseData ? cpPurchaseData.value : 0,
            closingStockQty: cpClosingStockData ? cpClosingStockData[0].qty : 0,
            closingStockValue: cpClosingStockData ? cpClosingStockData[0].value : 0,
        };

        const rmConsumptionCogsData = {
            openingStock: (cpCogsData?.openingStock || 0) + (mdCogsData?.openingStock || 0) + (hdpeCogsData?.openingStock || 0),
            openingStockValue: (cpCogsData?.openingStockValue || 0) + (mdCogsData?.openingStockValue || 0) + (hdpeCogsData?.openingStockValue || 0),
            purchaseQty: (cpCogsData?.purchaseQty || 0) + (mdCogsData?.purchaseQty || 0) + (hdpeCogsData?.purchaseQty || 0),
            purchaseValue: (cpCogsData?.purchaseValue || 0) + (mdCogsData?.purchaseValue || 0) + (hdpeCogsData?.purchaseValue || 0),
            sales: hdpeCogsData?.salesQty || 0,
            salesValue: hdpeCogsData?.salesValue || 0,
            closingStock: (cpCogsData?.closingStockQty || 0) + (mdCogsData?.closingStockQty || 0) + (hdpeCogsData?.closingStockQty || 0),
            closingStockValue: (cpCogsData?.closingStockValue || 0) + (mdCogsData?.closingStockValue || 0) + (hdpeCogsData?.closingStockValue || 0),
        };

        const yarnPurchaseData = await prisma.yarnPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const sravyaOthersData = await prisma.sravyaOthersPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const consumablesData = await prisma.ConsumablesPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const monofilCogsData = {
            yarnPurchases: yarnPurchaseData ? yarnPurchaseData.kgs : 0,
            yarnValue: yarnPurchaseData ? yarnPurchaseData.value : 0,
            purchaseFabric: sravyaOthersData ? sravyaOthersData.kgs : 0,
            purchaseFabricValue: sravyaOthersData ? sravyaOthersData.value : 0,
            consumablesPurchase: consumablesData ? consumablesData.value : 0,
        };

        const stockvaluationData = await prisma.stockValuation.findMany({
            where: { time_id: oneMonthBackRecord.id, material_type: "shadenet_fabrics_weed_mat" },
        });

        const tradingConsumptionCogsData = {
            openingStock: stockvaluationData ? stockvaluationData[0].qty : 0,
        };

        const totalCogsDataCOGS = {
            openingStock: rmConsumptionCogsData.openingStock || 0,
            openingStockValue: rmConsumptionCogsData.openingStockValue || 0,
            purchaseHD: hdpeCogsData.purchaseQty || 0,
            purchaseHDValue: hdpeCogsData.purchaseValue || 0,
            purchaseMD: mdCogsData.purchaseQty || 0,
            purchaseMDValue: mdCogsData.purchaseValue || 0,
            purchaseMonofil: monofilCogsData.yarnPurchases || 0,
            purchaseMonofilValue: monofilCogsData.yarnValue || 0,
            rmSales: rmConsumptionCogsData.sales || 0,
            rmSalesValue: rmConsumptionCogsData.salesValue || 0,
            closingStock: rmConsumptionCogsData.closingStock || 0,
            closingStockValue: rmConsumptionCogsData.closingStockValue || 0,
        };

        const stockVal = await prisma.stockValuation.findMany({
            where: {
                time_id: oneMonthBackRecord.id,
                AND: { material_type: { in: ["hdpe_tape_factory", "hdpe_tape_job_work"] } },
            },
        });

        const stockValFrabric = await prisma.stockValuation.findMany({
            where: { time_id: oneMonthBackRecord.id, material_type: "hdpe_fishnet_fabrics" },
        });

        const monofilSFGnFGOpeningStockCOGS = {
            sfg_yarn: (stockVal[0] ? stockVal[0].qty : 0) + (stockVal[1] ? stockVal[1].qty : 0),
            sfg_yarn_value: (stockVal[0] ? stockVal[0].value : 0) + (stockVal[1] ? stockVal[1].value : 0),
            fg_fabric: stockValFrabric ? stockValFrabric[0].qty : 0,
            fg_fabric_value: stockValFrabric ? stockValFrabric[0].value : 0,
        };

        const purchaseYarn = await prisma.yarnPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const monofilSFGnFGPurchaseCOGS = {
            sfg_yarn: purchaseYarn ? purchaseYarn.kgs : 0,
            sfg_yarn_value: purchaseYarn ? purchaseYarn.value : 0,
            fg_fabric: sravyaOthersData ? sravyaOthersData.kgs : 0,
            fg_fabric_value: sravyaOthersData ? sravyaOthersData.value : 0,
            consumables: consumablesData ? consumablesData.value : 0,
        };

        const stockValClosing = await prisma.stockValuation.findMany({
            where: {
                time_id: timeRecord.id,
                AND: { material_type: { in: ["hdpe_tape_factory", "hdpe_tape_job_work"] } },
            },
        });

        const stockValFrabricClosing = await prisma.stockValuation.findMany({
            where: { time_id: timeRecord.id, material_type: "hdpe_fishnet_fabrics" },
        });

        const monogilSFGnFGClosingStockCOGS = {
            sfg_yarn: (stockValClosing[0] ? stockValClosing[0].qty : 0) + (stockValClosing[1] ? stockValClosing[1].qty : 0),
            sfg_yarn_value: (stockValClosing[0] ? stockValClosing[0].value : 0) + (stockValClosing[1] ? stockValClosing[1].value : 0),
            fg_fabric: stockValFrabricClosing ? stockValFrabricClosing[0].qty : 0,
            fg_fabric_value: stockValFrabricClosing ? stockValFrabricClosing[0].value : 0,
        };

        const stockvalOpening = await prisma.stockValuation.findMany({
            where: { time_id: oneMonthBackRecord.id, material_type: "shadenet_fabrics_weed_mat" },
        });

        const stockValClosingStock = await prisma.stockValuation.findMany({
            where: {
                time_id: timeRecord.id,
                AND: { material_type: { in: ["shadenet_fabrics_weed_mat", "pp_fabric_sacks"] } },
            },
        });

        const tradingCOGS = {
            openingStock: stockvalOpening ? stockvalOpening[0].qty : 0,
            openingStockValue: stockvalOpening ? stockvalOpening[0].value : 0,
            closingStock: (stockValClosingStock[0] ? stockValClosingStock[0].qty : 0) + (stockValClosingStock[1] ? stockValClosingStock[1].qty : 0),
            closingStockValue: (stockValClosingStock[0] ? stockValClosingStock[0].value : 0) + (stockValClosingStock[1] ? stockValClosingStock[1].value : 0),
        };

        tradingCOGS.difference_stock = Math.abs(tradingCOGS.openingStock - tradingCOGS.closingStock);
        tradingCOGS.difference_stock_value = Math.abs(tradingCOGS.openingStockValue - tradingCOGS.closingStockValue);

        // Upsert data to Prisma (same as original)
        await prisma.hdpeCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...hdpeCogsData },
            create: { time_id: timeRecord.id, ...hdpeCogsData },
        });

        await prisma.mdCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...mdCogsData },
            create: { time_id: timeRecord.id, ...mdCogsData },
        });

        await prisma.cpCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...cpCogsData },
            create: { time_id: timeRecord.id, ...cpCogsData },
        });

        await prisma.rmConsumptionCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...rmConsumptionCogsData },
            create: { time_id: timeRecord.id, ...rmConsumptionCogsData },
        });

        await prisma.monofilCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...monofilCogsData },
            create: { time_id: timeRecord.id, ...monofilCogsData },
        });

        await prisma.totalCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...totalCogsDataCOGS },
            create: { time_id: timeRecord.id, ...totalCogsDataCOGS },
        });

        await prisma.monofilSFGnFGOpeningStock.upsert({
            where: { time_id: timeRecord.id },
            update: { ...monofilSFGnFGOpeningStockCOGS },
            create: { time_id: timeRecord.id, ...monofilSFGnFGOpeningStockCOGS },
        });

        await prisma.monofilSFGnFGPurchase.upsert({
            where: { time_id: timeRecord.id },
            update: { ...monofilSFGnFGPurchaseCOGS },
            create: { time_id: timeRecord.id, ...monofilSFGnFGPurchaseCOGS },
        });

        await prisma.monofilSFGnFGClosingStock.upsert({
            where: { time_id: timeRecord.id },
            update: { ...monogilSFGnFGClosingStockCOGS },
            create: { time_id: timeRecord.id, ...monogilSFGnFGClosingStockCOGS },
        });

        await prisma.tradingCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...tradingCOGS },
            create: { time_id: timeRecord.id, ...tradingCOGS },
        });

        // Prepare data for Excel
        const monthHeader = req.query.month;
        const calculateRate = (value, qty) => qty !== 0 ? (value / qty).toFixed(2) : 0;

        const hdpeData = [
            ["HDPE", "", "", ""],
            ["Opening Stock", hdpeCogsData.openingStock, calculateRate(hdpeCogsData.openingStockValue, hdpeCogsData.openingStock), hdpeCogsData.openingStockValue],
            ["Purchase", hdpeCogsData.purchaseQty, calculateRate(hdpeCogsData.purchaseValue, hdpeCogsData.purchaseQty), hdpeCogsData.purchaseValue],
            ["Sales", hdpeCogsData.salesQty, calculateRate(hdpeCogsData.salesValue, hdpeCogsData.salesQty), hdpeCogsData.salesValue],
            ["Closing Stock", hdpeCogsData.closingStockQty, calculateRate(hdpeCogsData.closingStockValue, hdpeCogsData.closingStockQty), hdpeCogsData.closingStockValue],
            ["Consumption HDPE",
                hdpeCogsData.openingStock + hdpeCogsData.purchaseQty - (hdpeCogsData.salesQty + hdpeCogsData.closingStockQty),
                calculateRate(
                    hdpeCogsData.openingStockValue + hdpeCogsData.purchaseValue - (hdpeCogsData.salesValue + hdpeCogsData.closingStockValue),
                    hdpeCogsData.openingStock + hdpeCogsData.purchaseQty - (hdpeCogsData.salesQty + hdpeCogsData.closingStockQty)
                ),
                hdpeCogsData.openingStockValue + hdpeCogsData.purchaseValue - (hdpeCogsData.salesValue + hdpeCogsData.closingStockValue)
            ],
        ];

        const mdData = [
            ["MB", "", "", ""],
            ["Opening Stock", mdCogsData.openingStock, calculateRate(mdCogsData.openingStockValue, mdCogsData.openingStock), mdCogsData.openingStockValue],
            ["Purchase", mdCogsData.purchaseQty, calculateRate(mdCogsData.purchaseValue, mdCogsData.purchaseQty), mdCogsData.purchaseValue],
            ["Closing Stock", mdCogsData.closingStockQty, calculateRate(mdCogsData.closingStockValue, mdCogsData.closingStockQty), mdCogsData.closingStockValue],
            ["Consumption MB", ((mdCogsData.openingStock + mdCogsData.purchaseQty) - (mdCogsData.closingStockQty)), calculateRate(((mdCogsData.openingStockValue + mdCogsData.purchaseValue) - (mdCogsData.closingStockValue)), ((mdCogsData.openingStock + mdCogsData.purchaseQty) - (mdCogsData.closingStockQty))), ((mdCogsData.openingStockValue + mdCogsData.purchaseValue) - (mdCogsData.closingStockValue))],
        ];

        const cpData = [
            ["CP", "", "", ""],
            ["Opening Stock", cpCogsData.openingStock, calculateRate(cpCogsData.openingStockValue, cpCogsData.openingStock), cpCogsData.openingStockValue],
            ["Purchase", cpCogsData.purchaseQty, calculateRate(cpCogsData.purchaseValue, cpCogsData.purchaseQty), cpCogsData.purchaseValue],
            ["Closing Stock", cpCogsData.closingStockQty, calculateRate(cpCogsData.closingStockValue, cpCogsData.closingStockQty), cpCogsData.closingStockValue],
            ["Consumption CP", ((cpCogsData.openingStock + cpCogsData.purchaseQty) - (cpCogsData.closingStockQty)), calculateRate(((cpCogsData.openingStockValue + cpCogsData.purchaseValue) - (cpCogsData.closingStockValue)), ((cpCogsData.openingStock + cpCogsData.purchaseQty) - (cpCogsData.closingStockQty))), ((cpCogsData.openingStockValue + cpCogsData.purchaseValue) - (cpCogsData.closingStockValue))]
        ];

        const rmData = [
            ["RM Consumption", "", "", ""],
            ["Opening Stock", rmConsumptionCogsData.openingStock, calculateRate(rmConsumptionCogsData.openingStockValue, rmConsumptionCogsData.openingStock), rmConsumptionCogsData.openingStockValue],
            ["Purchase", rmConsumptionCogsData.purchaseQty, calculateRate(rmConsumptionCogsData.purchaseValue, rmConsumptionCogsData.purchaseQty), rmConsumptionCogsData.purchaseValue],
            ["Sales", rmConsumptionCogsData.sales, calculateRate(rmConsumptionCogsData.salesValue, rmConsumptionCogsData.sales), rmConsumptionCogsData.salesValue],
            ["Closing Stock", rmConsumptionCogsData.closingStock, calculateRate(rmConsumptionCogsData.closingStockValue, rmConsumptionCogsData.closingStock), rmConsumptionCogsData.closingStockValue],
            ["Consumption RM", ((rmConsumptionCogsData.openingStock + rmConsumptionCogsData.purchaseQty) - (rmConsumptionCogsData.closingStock + rmConsumptionCogsData.sales)), calculateRate(((rmConsumptionCogsData.openingStockValue + rmConsumptionCogsData.purchaseValue) - (rmConsumptionCogsData.closingStockValue + rmConsumptionCogsData.salesValue)), ((rmConsumptionCogsData.openingStock + rmConsumptionCogsData.purchaseQty) - (rmConsumptionCogsData.closingStock + rmConsumptionCogsData.sales))), ((rmConsumptionCogsData.openingStockValue + rmConsumptionCogsData.purchaseValue) - (rmConsumptionCogsData.closingStockValue + rmConsumptionCogsData.salesValue))]
        ];

        const monofilData = [
            ["Monofilament", "", "", ""],
            ["Yarn Purchases", monofilCogsData.yarnPurchases, calculateRate(monofilCogsData.yarnValue, monofilCogsData.yarnPurchases), monofilCogsData.yarnValue],
            ["Purchase Fabric", monofilCogsData.purchaseFabric, calculateRate(monofilCogsData.purchaseFabricValue, monofilCogsData.purchaseFabric), monofilCogsData.purchaseFabricValue],
            ["Consumables Purchase", "", "", monofilCogsData.consumablesPurchase],
            ["Total Purchase", (monofilCogsData.yarnPurchases + monofilCogsData.purchaseFabric), calculateRate((monofilCogsData.purchaseFabricValue + monofilCogsData.yarnValue + monofilCogsData.consumablesPurchase), (monofilCogsData.yarnPurchases + monofilCogsData.purchaseFabric)), (monofilCogsData.purchaseFabricValue + monofilCogsData.yarnValue + monofilCogsData.consumablesPurchase)],
            ["Consumption Monofil", (monofilCogsData.yarnPurchases + monofilCogsData.purchaseFabric), calculateRate((monofilCogsData.purchaseFabricValue + monofilCogsData.yarnValue + monofilCogsData.consumablesPurchase), (monofilCogsData.yarnPurchases + monofilCogsData.purchaseFabric)), (monofilCogsData.purchaseFabricValue + monofilCogsData.yarnValue + monofilCogsData.consumablesPurchase)],
        ];

        monofilData.push([
            "Monofil Consumption",
            monofilData.at(-1)[1] + rmData.at(-1)[1],
            calculateRate(
                monofilData.at(-1).at(-1) + rmData.at(-1).at(-1),
                monofilData.at(-1)[1] + rmData.at(-1)[1]
            ),
            monofilData.at(-1).at(-1) + rmData.at(-1).at(-1)
        ]);


        const totalCogsData = [
            ["Total COGS", "", "", ""],
            ["Opening Stock", totalCogsDataCOGS.openingStock, calculateRate(totalCogsDataCOGS.openingStockValue, totalCogsDataCOGS.openingStock), totalCogsDataCOGS.openingStockValue],
            ["Purchase HD", totalCogsDataCOGS.purchaseHD, calculateRate(totalCogsDataCOGS.purchaseHDValue, totalCogsDataCOGS.purchaseHD), totalCogsDataCOGS.purchaseHDValue],
            ["Purchase MD", totalCogsDataCOGS.purchaseMD, calculateRate(totalCogsDataCOGS.purchaseMDValue, totalCogsDataCOGS.purchaseMD), totalCogsDataCOGS.purchaseMDValue],
            ["Purchase Monofil", totalCogsDataCOGS.purchaseMonofil, calculateRate(totalCogsDataCOGS.purchaseMonofilValue, totalCogsDataCOGS.purchaseMonofil), totalCogsDataCOGS.purchaseMonofilValue],
            ["RM Sales", totalCogsDataCOGS.rmSales, calculateRate(totalCogsDataCOGS.rmSalesValue, totalCogsDataCOGS.rmSales), totalCogsDataCOGS.rmSalesValue],
            ["Closing Stock", totalCogsDataCOGS.closingStock, calculateRate(totalCogsDataCOGS.closingStockValue, totalCogsDataCOGS.closingStock), totalCogsDataCOGS.closingStockValue]
        ];

        const monofilSFGOpening = [
            ["Monofil SFG/FG Opening Stock", "", "", ""],
            ["SFG Yarn", monofilSFGnFGOpeningStockCOGS.sfg_yarn, calculateRate(monofilSFGnFGOpeningStockCOGS.sfg_yarn_value, monofilSFGnFGOpeningStockCOGS.sfg_yarn), monofilSFGnFGOpeningStockCOGS.sfg_yarn_value],
            ["FG Fabric", monofilSFGnFGOpeningStockCOGS.fg_fabric, calculateRate(monofilSFGnFGOpeningStockCOGS.fg_fabric_value, monofilSFGnFGOpeningStockCOGS.fg_fabric), monofilSFGnFGOpeningStockCOGS.fg_fabric_value]
        ];

        const monofilSFGPurchase = [
            ["Monofil SFG/FG Purchase", "", "", ""],
            ["SFG Yarn", monofilSFGnFGPurchaseCOGS.sfg_yarn, calculateRate(monofilSFGnFGPurchaseCOGS.sfg_yarn_value, monofilSFGnFGPurchaseCOGS.sfg_yarn), monofilSFGnFGPurchaseCOGS.sfg_yarn_value],
            ["FG Fabric", monofilSFGnFGPurchaseCOGS.fg_fabric, calculateRate(monofilSFGnFGPurchaseCOGS.fg_fabric_value, monofilSFGnFGPurchaseCOGS.fg_fabric), monofilSFGnFGPurchaseCOGS.fg_fabric_value],
            ["Consumables", "", "", monofilSFGnFGPurchaseCOGS.consumables]
        ];

        const monofilSFGClosing = [
            ["Monofil SFG/FG Closing Stock", "", "", ""],
            ["SFG Yarn", monogilSFGnFGClosingStockCOGS.sfg_yarn, calculateRate(monogilSFGnFGClosingStockCOGS.sfg_yarn_value, monogilSFGnFGClosingStockCOGS.sfg_yarn), monogilSFGnFGClosingStockCOGS.sfg_yarn_value],
            ["FG Fabric", monogilSFGnFGClosingStockCOGS.fg_fabric, calculateRate(monogilSFGnFGClosingStockCOGS.fg_fabric_value, monogilSFGnFGClosingStockCOGS.fg_fabric), monogilSFGnFGClosingStockCOGS.fg_fabric_value]
        ];

        const tradingData = [
            ["Trading COGS", "", "", ""],
            ["Opening Stock", tradingCOGS.openingStock, calculateRate(tradingCOGS.openingStockValue, tradingCOGS.openingStock), tradingCOGS.openingStockValue],
            ["Closing Stock", tradingCOGS.closingStock, calculateRate(tradingCOGS.closingStockValue, tradingCOGS.closingStock), tradingCOGS.closingStockValue],
            ["Difference Stock", tradingCOGS.difference_stock, calculateRate(tradingCOGS.difference_stock_value, tradingCOGS.difference_stock), tradingCOGS.difference_stock_value]
        ];

        // Determine the starting column for the new data
        let startCol = 1; // Default to column B (1-based index, A is 0)
        if (fileExists) {
            // Find the last column with data in the header row (row 1)
            const range = xlsx.utils.decode_range(ws['!ref']);
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col });
                if (!ws[cellAddress] || !ws[cellAddress].v) {
                    startCol = col;
                    break;
                }
            }
            // If no empty column found, append after the last column
            if (startCol === 1) {
                startCol = range.e.c + 1;
            }
        }

        // Prepare the data to append
        const allData = [
            ...hdpeData, [""],
            ...mdData, [""],
            ...cpData, [""],
            ...rmData, [""],
            ...monofilData, [""],
            ...totalCogsData, [""],
            ...monofilSFGOpening, [""],
            ...monofilSFGPurchase, [""],
            ...monofilSFGClosing, [""],
            ...tradingData
        ];

        // If file doesn't exist, add headers and particulars
        if (!fileExists) {
            const headers = [
                ["Particulars", monthHeader, "", ""],
                ["", "Qty", "Rate", "Value"]
            ];
            xlsx.utils.sheet_add_aoa(ws, headers, { origin: "A1" });
            // Add particulars in the first column
            const particulars = allData.map(row => [row[0]]);
            xlsx.utils.sheet_add_aoa(ws, particulars, { origin: "A3" });
        } else {
            // Update header with new month
            xlsx.utils.sheet_add_aoa(ws, [[monthHeader, "", ""]], { origin: { r: 0, c: startCol } });
            xlsx.utils.sheet_add_aoa(ws, [["Qty", "Rate", "Value"]], { origin: { r: 1, c: startCol } });
        }

        // Add new data (Qty, Rate, Value) starting from the third row
        let rowIndex = 2; // Start from row 3 (0-based index)
        for (const section of allData) {
            if (section[0] !== "") { // Only write non-empty rows
                const dataRow = section.slice(1); // Take Qty, Rate, Value
                xlsx.utils.sheet_add_aoa(ws, [dataRow], { origin: { r: rowIndex, c: startCol } });
            }
            rowIndex++; // Increment rowIndex for all rows, including empty ones
        }

        // Set column widths
        ws['!cols'] = ws['!cols'] || [];
        for (let i = 0; i < startCol + 4; i++) {
            ws['!cols'][i] = ws['!cols'][i] || { wch: i === 0 ? 25 : 15 };
        }

        // Add or update worksheet in workbook
        if (!fileExists) {
            xlsx.utils.book_append_sheet(wb, ws, "COGS");
        }

        // Write the file
        xlsx.writeFile(wb, filePath);
        console.log(`📊 Excel file updated: ${filePath}`);

        return res.json({ message: 'COGS data extracted and added successfully' });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// app.get("/pal1", async (req, res) => {
//     try {
//         const month = req.query.month

//         const date = parseExcelDate(month);

//         const timeRecord = await prisma.timeRecord.findUnique({
//             where: {
//                 time: date,
//             },
//         });

//         if (!timeRecord) {
//             return res.status(404).json({ message: 'Time record not found for the given date' });
//         }

//         const oneMonthBackRecord = await prisma.timeRecord.findFirst({
//             where: {
//                 time: new Date(date.setMonth(date.getMonth() - 1)),
//             }
//         });

//         if (!oneMonthBackRecord) {
//             return res.status(404).json({ message: 'Time record not found for the previous month' });
//         }

//         const opstock = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: oneMonthBackRecord.id,
//                 AND: {
//                     material_type: {
//                         in: ["pp_fabric_sacks", "shadenet_fabrics_weed_mat", "hdpe_fishnet_fabrics", "hdpe_tape_factory", "hdpe_tape_job_work", "hdpeGranules", "masterBatches", "colourPigments"]
//                     }
//                 }
//             }
//         });

//         const cpPurchase = await prisma.cPPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const mbPurchase = await prisma.mBPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const hdpePurchase = await prisma.hdpePurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const discount = await prisma.ConsumablesPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const purchTrading = await prisma.TRDNGPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const yarnPurch = await prisma.yarnPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const sravyaPurch = await prisma.sravyaOthersPurchase.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const clstock = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: timeRecord.id,
//                 AND: {
//                     material_type: {
//                         in: ["pp_fabric_sacks", "shadenet_fabrics_weed_mat", "hdpe_fishnet_fabrics", "hdpe_tape_factory", "hdpe_tape_job_work", "hdpeGranules", "masterBatches", "colourPigments"]
//                     }
//                 }
//             }
//         });

//         const sales = await prisma.salesDetails.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const waste = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "HDPE Monofilament Waste"
//             }
//         });

//         const palFinal = await prisma.salesDetails.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         })

//         const directExpenses = await prisma.extrasManaufacturingDirectExpenses.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             }
//         });

//         const indirectExpenses = await prisma.totals.findMany({
//             where: {
//                 time_id: timeRecord.id,
//                 type: "Indirect COST"
//             }
//         });

//         const pal1Data = {
//             openingStock: opstock.reduce((acc, item) => acc + item.qty, 0),
//             openingStockValue: opstock.reduce((acc, item) => acc + item.value, 0),

//             purchaseRm: (cpPurchase ? cpPurchase.kgs : 0) + (mbPurchase ? mbPurchase.kgs : 0) + (hdpePurchase ? hdpePurchase.kgs : 0),
//             purchaseRmValue: ((cpPurchase ? cpPurchase.value : 0) + (mbPurchase ? mbPurchase.value : 0) + (hdpePurchase ? hdpePurchase.value : 0)) - (discount ? discount.discount : 0),

//             purchaseTrading: purchTrading ? purchTrading.kgs : 0,
//             purchaseTradingValue: purchTrading ? purchTrading.value : 0,

//             purchaseConsumables: (yarnPurch ? yarnPurch.kgs : 0) + (sravyaPurch ? sravyaPurch.kgs : 0),
//             purchaseConsumablesValue: (yarnPurch ? yarnPurch.value : 0) + (sravyaPurch ? sravyaPurch.value : 0) + (discount ? discount.value : 0),

//             closingStock: clstock.reduce((acc, item) => acc + item.qty, 0),
//             closingStockValue: clstock.reduce((acc, item) => acc + item.value, 0),

//             sales: (sales ? sales.grandTotalOutward : 0) - (waste ? waste.outwardQty : 0),
//             salesValue: palFinal ? palFinal.pal1FinalSales : 0,

//             waste: waste ? waste.outwardQty : 0,
//             wasteValue: waste ? waste.amount : 0,

//             otherInc: palFinal ? palFinal.otherIncome : 0,

//             directExpenses: directExpenses ? directExpenses.manufacturing : 0,

//             inHouseFabricationQty: directExpenses ? directExpenses.inHouseQty : 0,
//             inHouseFabricationValue: directExpenses ? directExpenses.inHouseFabrication : 0,

//             fabricationQty: directExpenses ? directExpenses.fabricators : 0,
//             fabricationValue: directExpenses ? directExpenses.fabrication : 0,

//             deprecation: directExpenses ? directExpenses.deprecation : 0,

//             indirectExpenses: indirectExpenses[0] ? indirectExpenses[0].value : 0,

//         }

//         pal1Data.directCost = pal1Data.directExpenses + pal1Data.fabricationValue + pal1Data.inHouseFabricationValue
//         pal1Data.totalCost = pal1Data.directCost + pal1Data.indirectExpenses + pal1Data.deprecation

//         const d8 = pal1Data.openingStockValue + pal1Data.purchaseRmValue + pal1Data.purchaseTradingValue + pal1Data.purchaseConsumablesValue;
//         const d10 = d8 - pal1Data.closingStockValue
//         const d12 = pal1Data.salesValue - d10

//         const d17 = d12 + pal1Data.wasteValue + pal1Data.otherInc

//         pal1Data.ProfitA = Math.abs(d17 - (pal1Data.directCost + pal1Data.indirectExpenses + pal1Data.deprecation))

//         console.log('📊 PAL1 Data:', pal1Data);


//         const wb = xlsx.utils.book_new();
//         const ws = xlsx.utils.json_to_sheet([], { skipHeader: true }); // Start with an empty sheet

//         // Define the header row
//         const monthHeader = req.query.month; // You can dynamically set this based on the `month` query param if needed
//         const headers = [
//             ["Particulars", monthHeader, "", ""], // Empty cells for alignment
//             ["", "Qty", "Rate", "Value"] // Column headers
//         ];

//         // Helper function to calculate rate (value/qty) and handle division by zero
//         const calculateRate = (value, qty) => qty !== 0 ? (value / qty).toFixed(2) : 0;

//         // PAL1 Data for Excel
//         const pal1ExcelData = [
//             ["Opening Stock", pal1Data.openingStock, calculateRate(pal1Data.openingStockValue, pal1Data.openingStock), pal1Data.openingStockValue],
//             ["Purchase RM", pal1Data.purchaseRm, calculateRate(pal1Data.purchaseRmValue, pal1Data.purchaseRm), pal1Data.purchaseRmValue],
//             ["Purchase Trading", pal1Data.purchaseTrading, calculateRate(pal1Data.purchaseTradingValue, pal1Data.purchaseTrading), pal1Data.purchaseTradingValue],
//             ["Purchase Consumables", pal1Data.purchaseConsumables, calculateRate(pal1Data.purchaseConsumablesValue, pal1Data.purchaseConsumables), pal1Data.purchaseConsumablesValue],
//             ["Closing Stock", pal1Data.closingStock, calculateRate(pal1Data.closingStockValue, pal1Data.closingStock), pal1Data.closingStockValue],
//             ["Sales", pal1Data.sales, calculateRate(pal1Data.salesValue, pal1Data.sales), pal1Data.salesValue],
//             ["Waste", pal1Data.waste, calculateRate(pal1Data.wasteValue, pal1Data.waste), pal1Data.wasteValue],
//             ["Other Income", "", "", pal1Data.otherInc], // No Qty for Other Income
//             ["Direct Expenses", "", "", pal1Data.directExpenses], // No Qty for Direct Expenses
//             ["In-House Fabrication", pal1Data.inHouseFabricationQty, calculateRate(pal1Data.inHouseFabricationValue, pal1Data.inHouseFabricationQty), pal1Data.inHouseFabricationValue],
//             ["Fabrication", pal1Data.fabricationQty, calculateRate(pal1Data.fabricationValue, pal1Data.fabricationQty), pal1Data.fabricationValue],
//             ["Deprecation", "", "", pal1Data.deprecation], // No Qty for Deprecation
//             ["Indirect Expenses", "", "", pal1Data.indirectExpenses], // No Qty for Indirect Expenses
//             ["Direct Cost", "", "", pal1Data.directCost], // Calculated field, no Qty
//             ["Total Cost", "", "", pal1Data.totalCost], // Calculated field, no Qty
//             ["Profit A", "", "", pal1Data.ProfitA] // Calculated field, no Qty
//         ];

//         // Combine headers and data
//         const allData = [
//             ...headers,
//             ...pal1ExcelData
//         ];

//         // Append all data to the worksheet
//         xlsx.utils.sheet_add_aoa(ws, allData, { origin: "A1" });

//         // Set column widths (optional)
//         ws['!cols'] = [
//             { wch: 25 }, // Particulars
//             { wch: 15 }, // Qty
//             { wch: 15 }, // Rate
//             { wch: 15 }  // Value
//         ];

//         // Add the worksheet to the workbook
//         xlsx.utils.book_append_sheet(wb, ws, "PAL1");

//         // Write the file
//         const filePath = `./PAL1_${monthHeader}.xlsx`;
//         xlsx.writeFile(wb, filePath);

//         console.log(`📊 Excel file generated: ${filePath}`);


//         await prisma.pal1.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...pal1Data },
//             create: { time_id: timeRecord.id, ...pal1Data },
//         });
//         console.log('📊 PAL1 Data upserted:', pal1Data);

//         return res.json({ message: 'PAL1 data extracted and added successfully' });

//     } catch (error) {
//         console.error('❌ Error:', error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// }
// );


app.get("/pal1", async (req, res) => {
    try {
        const month = req.query.month;
        const date = parseExcelDate(month);
        const filePath = path.join(__dirname, `PAL1.xlsx`); // Fixed file name
        let wb, ws;

        // Check if the file exists
        const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);

        if (fileExists) {
            // Read existing workbook
            wb = xlsx.readFile(filePath);
            ws = wb.Sheets[wb.SheetNames[0]]; // Assume data is in the first sheet
        } else {
            // Create new workbook and worksheet
            wb = xlsx.utils.book_new();
            ws = xlsx.utils.json_to_sheet([], { skipHeader: true });
        }

        const timeRecord = await prisma.timeRecord.findUnique({
            where: { time: date },
        });

        if (!timeRecord) {
            return res.status(404).json({ message: 'Time record not found for the given date' });
        }

        const oneMonthBackRecord = await prisma.timeRecord.findFirst({
            where: { time: new Date(date.setMonth(date.getMonth() - 1)) },
        });

        if (!oneMonthBackRecord) {
            return res.status(404).json({ message: 'Time record not found for the previous month' });
        }

        const opstock = await prisma.stockValuation.findMany({
            where: {
                time_id: oneMonthBackRecord.id,
                AND: {
                    material_type: {
                        in: ["pp_fabric_sacks", "shadenet_fabrics_weed_mat", "hdpe_fishnet_fabrics", "hdpe_tape_factory", "hdpe_tape_job_work", "hdpeGranules", "masterBatches", "colourPigments"]
                    }
                }
            }
        });

        const cpPurchase = await prisma.cPPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const mbPurchase = await prisma.mBPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const hdpePurchase = await prisma.hdpePurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const discount = await prisma.ConsumablesPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const purchTrading = await prisma.TRDNGPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const yarnPurch = await prisma.yarnPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const sravyaPurch = await prisma.sravyaOthersPurchase.findUnique({
            where: { time_id: timeRecord.id },
        });

        const clstock = await prisma.stockValuation.findMany({
            where: {
                time_id: timeRecord.id,
                AND: {
                    material_type: {
                        in: ["pp_fabric_sacks", "shadenet_fabrics_weed_mat", "hdpe_fishnet_fabrics", "hdpe_tape_factory", "hdpe_tape_job_work", "hdpeGranules", "masterBatches", "colourPigments"]
                    }
                }
            }
        });

        const sales = await prisma.salesDetails.findUnique({
            where: { time_id: timeRecord.id },
        });

        const waste = await prisma.inventoryDetails.findFirst({
            where: { time_id: timeRecord.id, materialName: "HDPE Monofilament Waste" },
        });

        const palFinal = await prisma.salesDetails.findUnique({
            where: { time_id: timeRecord.id },
        });

        const directExpenses = await prisma.extrasManaufacturingDirectExpenses.findUnique({
            where: { time_id: timeRecord.id },
        });

        const indirectExpenses = await prisma.totals.findMany({
            where: { time_id: timeRecord.id, type: "Indirect COST" },
        });

        const pal1Data = {
            openingStock: opstock.reduce((acc, item) => acc + item.qty, 0),
            openingStockValue: opstock.reduce((acc, item) => acc + item.value, 0),
            purchaseRm: (cpPurchase ? cpPurchase.kgs : 0) + (mbPurchase ? mbPurchase.kgs : 0) + (hdpePurchase ? hdpePurchase.kgs : 0),
            purchaseRmValue: ((cpPurchase ? cpPurchase.value : 0) + (mbPurchase ? mbPurchase.value : 0) + (hdpePurchase ? hdpePurchase.value : 0)) - (discount ? discount.discount : 0),
            purchaseTrading: purchTrading ? purchTrading.kgs : 0,
            purchaseTradingValue: purchTrading ? purchTrading.value : 0,
            purchaseConsumables: (yarnPurch ? yarnPurch.kgs : 0) + (sravyaPurch ? sravyaPurch.kgs : 0),
            purchaseConsumablesValue: (yarnPurch ? yarnPurch.value : 0) + (sravyaPurch ? sravyaPurch.value : 0) + (discount ? discount.value : 0),
            closingStock: clstock.reduce((acc, item) => acc + item.qty, 0),
            closingStockValue: clstock.reduce((acc, item) => acc + item.value, 0),
            sales: (sales ? sales.grandTotalOutward : 0) - (waste ? waste.outwardQty : 0),
            salesValue: palFinal ? palFinal.pal1FinalSales : 0,
            waste: waste ? waste.outwardQty : 0,
            wasteValue: waste ? waste.amount : 0,
            otherInc: palFinal ? palFinal.otherIncome : 0,
            directExpenses: directExpenses ? directExpenses.manufacturing : 0,
            inHouseFabricationQty: directExpenses ? directExpenses.inHouseQty : 0,
            inHouseFabricationValue: directExpenses ? directExpenses.inHouseFabrication : 0,
            fabricationQty: directExpenses ? directExpenses.fabricators : 0,
            fabricationValue: directExpenses ? directExpenses.fabrication : 0,
            deprecation: directExpenses ? directExpenses.deprecation : 0,
            indirectExpenses: indirectExpenses[0] ? indirectExpenses[0].value : 0,
        };

        pal1Data.directCost = pal1Data.directExpenses + pal1Data.fabricationValue + pal1Data.inHouseFabricationValue;
        pal1Data.totalCost = pal1Data.directCost + pal1Data.indirectExpenses + pal1Data.deprecation;

        const d8 = pal1Data.openingStockValue + pal1Data.purchaseRmValue + pal1Data.purchaseTradingValue + pal1Data.purchaseConsumablesValue;
        const d10 = d8 - pal1Data.closingStockValue;
        const d12 = pal1Data.salesValue - d10;
        const d17 = d12 + pal1Data.wasteValue + pal1Data.otherInc;

        pal1Data.ProfitA = Math.abs(d17 - (pal1Data.directCost + pal1Data.indirectExpenses + pal1Data.deprecation));

        console.log('📊 PAL1 Data:', pal1Data);

        // Prepare data for Excel
        const monthHeader = req.query.month;
        const calculateRate = (value, qty) => qty !== 0 ? (value / qty).toFixed(2) : 0;

        const pal1ExcelData = [
            ["Opening Stock", pal1Data.openingStock, calculateRate(pal1Data.openingStockValue, pal1Data.openingStock), pal1Data.openingStockValue],
            ["Purchase RM", pal1Data.purchaseRm, calculateRate(pal1Data.purchaseRmValue, pal1Data.purchaseRm), pal1Data.purchaseRmValue],
            ["Purchase Trading", pal1Data.purchaseTrading, calculateRate(pal1Data.purchaseTradingValue, pal1Data.purchaseTrading), pal1Data.purchaseTradingValue],
            ["Purchase Consumables", pal1Data.purchaseConsumables, calculateRate(pal1Data.purchaseConsumablesValue, pal1Data.purchaseConsumables), pal1Data.purchaseConsumablesValue],
            ["Closing Stock", pal1Data.closingStock, calculateRate(pal1Data.closingStockValue, pal1Data.closingStock), pal1Data.closingStockValue],
            ["Sales", pal1Data.sales, calculateRate(pal1Data.salesValue, pal1Data.sales), pal1Data.salesValue],
            ["Waste", pal1Data.waste, calculateRate(pal1Data.wasteValue, pal1Data.waste), pal1Data.wasteValue],
            ["Other Income", "", "", pal1Data.otherInc],
            ["Direct Expenses", "", "", pal1Data.directExpenses],
            ["In-House Fabrication", pal1Data.inHouseFabricationQty, calculateRate(pal1Data.inHouseFabricationValue, pal1Data.inHouseFabricationQty), pal1Data.inHouseFabricationValue],
            ["Fabrication", pal1Data.fabricationQty, calculateRate(pal1Data.fabricationValue, pal1Data.fabricationQty), pal1Data.fabricationValue],
            ["Deprecation", "", "", pal1Data.deprecation],
            ["Indirect Expenses", "", "", pal1Data.indirectExpenses],
            ["Direct Cost", "", "", pal1Data.directCost],
            ["Total Cost", "", "", pal1Data.totalCost],
            ["Profit A", "", "", pal1Data.ProfitA]
        ];

        // Determine the starting column for the new data
        let startCol = 1; // Default to column B (1-based index, A is 0)
        if (fileExists) {
            const range = xlsx.utils.decode_range(ws['!ref']);
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col });
                if (!ws[cellAddress] || !ws[cellAddress].v) {
                    startCol = col;
                    break;
                }
            }
            if (startCol === 1) {
                startCol = range.e.c + 1;
            }
        }

        // If file doesn't exist, add headers and particulars
        if (!fileExists) {
            const headers = [
                ["Particulars", monthHeader, "", ""],
                ["", "Qty", "Rate", "Value"]
            ];
            xlsx.utils.sheet_add_aoa(ws, headers, { origin: "A1" });
            const particulars = pal1ExcelData.map(row => [row[0]]);
            xlsx.utils.sheet_add_aoa(ws, particulars, { origin: "A3" });
        } else {
            xlsx.utils.sheet_add_aoa(ws, [[monthHeader, "", ""]], { origin: { r: 0, c: startCol } });
            xlsx.utils.sheet_add_aoa(ws, [["Qty", "Rate", "Value"]], { origin: { r: 1, c: startCol } });
        }

        // Add new data (Qty, Rate, Value) starting from the third row
        let rowIndex = 2; // Start from row 3 (0-based index)
        for (const section of pal1ExcelData) {
            const dataRow = section.slice(1); // Take Qty, Rate, Value
            xlsx.utils.sheet_add_aoa(ws, [dataRow], { origin: { r: rowIndex, c: startCol } });
            rowIndex++;
        }

        // Set column widths
        ws['!cols'] = ws['!cols'] || [];
        for (let i = 0; i < startCol + 4; i++) {
            ws['!cols'][i] = ws['!cols'][i] || { wch: i === 0 ? 25 : 15 };
        }

        // Add or update worksheet in workbook
        if (!fileExists) {
            xlsx.utils.book_append_sheet(wb, ws, "PAL1");
        }

        // Write the file
        xlsx.writeFile(wb, filePath);
        console.log(`📊 Excel file updated: ${filePath}`);

        await prisma.pal1.upsert({
            where: { time_id: timeRecord.id },
            update: { ...pal1Data },
            create: { time_id: timeRecord.id, ...pal1Data },
        });
        console.log('📊 PAL1 Data upserted:', pal1Data);

        return res.json({ message: 'PAL1 data extracted and added successfully' });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// app.get("/trading-pl", async (req, res) => {
//     try {
//         const month = req.query.month

//         const date = parseExcelDate(month);

//         const timeRecord = await prisma.timeRecord.findUnique({
//             where: {
//                 time: date,
//             },
//         });

//         if (!timeRecord) {
//             return res.status(404).json({ message: 'Time record not found for the given date' });
//         }

//         console.log(timeRecord);

//         const MSN = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "MSN"
//             }
//         });

//         const ANTI_BIRD_NET_Rope_MULCH_FIBC = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "ANTI BIRD NET / Rope/MULCH/FIBC"
//             }
//         });

//         const TSN = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "TSN"
//             }
//         });

//         const Weed_Mat_Black = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "Weed Mat 1.25 Mtrs Black"
//             }
//         });

//         const PP_Woven_Sacks = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "PP Woven Sacks"
//             }
//         });

//         // const Receipts_Mono_Shade = await prisma.ShadeNetsTradingQtyAnalysis.findFirst({
//         //     where:{
//         //         time_id:timeRecord.id,

//         //     }
//         // });

//         const PPSPurchase = await prisma.PPSPurchase.findFirst({
//             where: {
//                 time_id: timeRecord.id
//             }
//         });


//         const Purchase_TSN = await prisma.TSNPurchase.findFirst({
//             where: { time_id: timeRecord.id }
//         });

//         console.log(Purchase_TSN);

//         const Receipts_Mono_Shade = await prisma.shadeNetsTradingQtyAnalysis.findFirst({
//             where: {
//                 time_id: timeRecord.id
//             }
//         });


//         const trading_pl = {

//             // Sales- Mulch Film Fabric  ---empty

//             Sales_Mono_Shade_Net_Qty: Math.round(
//                 (MSN ? MSN.outwardQty : 0) + (ANTI_BIRD_NET_Rope_MULCH_FIBC ? ANTI_BIRD_NET_Rope_MULCH_FIBC.outwardQty : 0)),
//             Sales_Mono_Shade_Net_Value: (MSN ? MSN.amount : 0) + (ANTI_BIRD_NET_Rope_MULCH_FIBC ? ANTI_BIRD_NET_Rope_MULCH_FIBC.amount : 0),

//             // Sales PP Woven  Fabrics  ---empty

//             Sales_Tape_Shade_Net_Qty: (TSN ? TSN.outwardQty : 0),
//             Sales_Tape_Shade_Net_Value: Math.round(TSN ? TSN.amount : 0),

//             Sales_Weed_Mate_Fabrics_Qty: Weed_Mat_Black ? Weed_Mat_Black.outwardQty : 0,
//             Sales_Weed_Mate_Fabrics_Value: Weed_Mat_Black ? Weed_Mat_Black.amount : 0,

//             Sales_PP_Woven_Sacks_Qty: PP_Woven_Sacks ? PP_Woven_Sacks.outwardQty : 0,
//             Sales_PP_Woven_Sacks_Value: PP_Woven_Sacks ? PP_Woven_Sacks.amount : 0,

//             Purchase_MSN_Qty: Math.round((Receipts_Mono_Shade ? Receipts_Mono_Shade.receiptsMonoShade : 0) + 479),
//             // Purchase_MSN_Value:

//             Purchase_PP_Sacks_Qty: Math.round(PPSPurchase ? PPSPurchase.kgs : 0),
//             Purchase_PP_Sacks_Value: PPSPurchase ? PPSPurchase.value : 0,

//             Purchase_TSN_Qty: Purchase_TSN ? Purchase_TSN.kgs : 0,
//             Purchase_TSN_Value: Math.round(Purchase_TSN ? Purchase_TSN.value : 0),

//             // Consumption_TSN_Qty: 0,   
//             // Consumption_TSN_Value: 0,

//             // Purchase_Others_Qty: 0,
//             // Purchase_Others_Value: 0,

//         }

//         const wb = xlsx.utils.book_new();
//         const ws = xlsx.utils.json_to_sheet([], { skipHeader: true }); // Start with an empty sheet

//         // Define the header row using req.query.month
//         const monthHeader = req.query.month; // Use the month from query param
//         const headers = [
//             ["Particulars", monthHeader, "", ""], // Empty cells for alignment
//             ["", "Qty", "Value", "Rate"] // Column headers
//         ];

//         // Helper function to calculate rate (value/qty) and handle division by zero
//         const calculateRate = (value, qty) => qty !== 0 && value !== "" ? (value / qty).toFixed(2) : "";

//         // Trading PL Data for Excel (restructured to match the image, with Add: Purchase MSN added)
//         const tradingPlExcelData = [
//             ["Sales Accounts", "", "", ""], // Header
//             ["Sales-Mulch Film Fabric", "", "", ""], // Empty as per your comment
//             ["Sales-Mono Shade Net", trading_pl.Sales_Mono_Shade_Net_Qty, trading_pl.Sales_Mono_Shade_Net_Value, calculateRate(trading_pl.Sales_Mono_Shade_Net_Value, trading_pl.Sales_Mono_Shade_Net_Qty)],
//             ["Sales-PP Woven Fabrics", "", "", ""], // Empty as per your comment
//             ["Sales-Tape Shade Net", trading_pl.Sales_Tape_Shade_Net_Qty, trading_pl.Sales_Tape_Shade_Net_Value, calculateRate(trading_pl.Sales_Tape_Shade_Net_Value, trading_pl.Sales_Tape_Shade_Net_Qty)],
//             ["Sales-Weed Mate Fabrics", trading_pl.Sales_Weed_Mate_Fabrics_Qty, trading_pl.Sales_Weed_Mate_Fabrics_Value, calculateRate(trading_pl.Sales_Weed_Mate_Fabrics_Value, trading_pl.Sales_Weed_Mate_Fabrics_Qty)],
//             ["Sales-PP Woven Sacks", trading_pl.Sales_PP_Woven_Sacks_Qty, trading_pl.Sales_PP_Woven_Sacks_Value, calculateRate(trading_pl.Sales_PP_Woven_Sacks_Value, trading_pl.Sales_PP_Woven_Sacks_Qty)],
//             ["Opening Stock", "", "", ""], // Missing data, left empty
//             ["Add Purchase", "", "", ""], // Header
//             ["Add: Purchase MSN", trading_pl.Purchase_MSN_Qty, "", ""], // Added here, Value and Rate empty since Purchase_MSN_Value is missing
//             ["Add: Purchase PP Sacks", trading_pl.Purchase_PP_Sacks_Qty, trading_pl.Purchase_PP_Sacks_Value, calculateRate(trading_pl.Purchase_PP_Sacks_Value, trading_pl.Purchase_PP_Sacks_Qty)],
//             ["Add: Purchase TSN", trading_pl.Purchase_TSN_Qty, trading_pl.Purchase_TSN_Value, calculateRate(trading_pl.Purchase_TSN_Value, trading_pl.Purchase_TSN_Qty)],
//             ["Add: Consumption TSN", "", "", ""], // Commented out, left empty
//             ["Add: Purchase Others", "", "", ""], // Commented out, left empty
//             ["Less: Closing Stock", "", "", ""], // Missing data, left empty
//             ["Cost of Sales", "", "", ""], // Calculated value missing, left empty
//             ["Conveyance Charges", "", "", ""], // Not relevant, left empty
//             ["Salary & Wages", "", "", ""], // Not relevant, left empty
//             ["Commission on Sales", "", "", ""], // Not relevant, left empty
//             ["Direct Expenses", "", "", ""], // Not relevant, left empty
//             ["Gross Profit", "", "", ""] // Calculated value missing, left empty
//         ];

//         // Combine headers and data
//         const allData = [
//             ...headers,
//             ...tradingPlExcelData
//         ];

//         // Append all data to the worksheet
//         xlsx.utils.sheet_add_aoa(ws, allData, { origin: "A1" });

//         // Set column widths (optional)
//         ws['!cols'] = [
//             { wch: 25 }, // Particulars
//             { wch: 15 }, // Qty
//             { wch: 15 }, // Value
//             { wch: 15 }  // Rate
//         ];

//         // Add the worksheet to the workbook
//         xlsx.utils.book_append_sheet(wb, ws, "TradingPL");

//         // Write the file
//         const filePath = `./TradingPL_${monthHeader}.xlsx`;
//         xlsx.writeFile(wb, filePath);

//         console.log(`📊 Excel file generated: ${filePath}`);

//         await prisma.tradingPl.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...trading_pl },
//             create: { time_id: timeRecord.id, ...trading_pl },
//         });
//         console.log('📊 TradingPl Data upserted:', trading_pl);

//         console.log('📊 trading_pl Data:', trading_pl);
//         return res.json({ message: 'Successfully created trading PL and generated Excel file', file: filePath });

//     } catch (error) {
//         console.error('❌ Error:', error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// }
// );

app.get('/trading-pl', async (req, res) => {
    try {
        const month = req.query.month;
        const date = parseExcelDate(month);
        const filePath = path.join(__dirname, `TradingPL.xlsx`); // Fixed file name
        let wb, ws;

        // Check if the file exists
        const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);

        if (fileExists) {
            // Read existing workbook
            wb = xlsx.readFile(filePath);
            ws = wb.Sheets[wb.SheetNames[0]]; // Assume data is in the first sheet
        } else {
            // Create new workbook and worksheet
            wb = xlsx.utils.book_new();
            ws = xlsx.utils.json_to_sheet([], { skipHeader: true });
        }

        const timeRecord = await prisma.timeRecord.findUnique({
            where: { time: date },
        });

        if (!timeRecord) {
            return res.status(404).json({ message: 'Time record not found for the given date' });
        }

        console.log(timeRecord);

        const MSN = await prisma.inventoryDetails.findFirst({
            where: { time_id: timeRecord.id, materialName: "MSN" },
        });

        const ANTI_BIRD_NET_Rope_MULCH_FIBC = await prisma.inventoryDetails.findFirst({
            where: { time_id: timeRecord.id, materialName: "ANTI BIRD NET / Rope/MULCH/FIBC" },
        });

        const TSN = await prisma.inventoryDetails.findFirst({
            where: { time_id: timeRecord.id, materialName: "TSN" },
        });

        const Weed_Mat_Black = await prisma.inventoryDetails.findFirst({
            where: { time_id: timeRecord.id, materialName: "Weed Mat 1.25 Mtrs Black" },
        });

        const PP_Woven_Sacks = await prisma.inventoryDetails.findFirst({
            where: { time_id: timeRecord.id, materialName: "PP Woven Sacks" },
        });

        const PPSPurchase = await prisma.PPSPurchase.findFirst({
            where: { time_id: timeRecord.id },
        });

        const Purchase_TSN = await prisma.TSNPurchase.findFirst({
            where: { time_id: timeRecord.id },
        });

        console.log(Purchase_TSN);

        const Receipts_Mono_Shade = await prisma.shadeNetsTradingQtyAnalysis.findFirst({
            where: { time_id: timeRecord.id },
        });

        const trading_pl = {
            Sales_Mono_Shade_Net_Qty: Math.round(
                (MSN ? MSN.outwardQty : 0) + (ANTI_BIRD_NET_Rope_MULCH_FIBC ? ANTI_BIRD_NET_Rope_MULCH_FIBC.outwardQty : 0)
            ),
            Sales_Mono_Shade_Net_Value: (MSN ? MSN.amount : 0) + (ANTI_BIRD_NET_Rope_MULCH_FIBC ? ANTI_BIRD_NET_Rope_MULCH_FIBC.amount : 0),
            Sales_Tape_Shade_Net_Qty: TSN ? TSN.outwardQty : 0,
            Sales_Tape_Shade_Net_Value: Math.round(TSN ? TSN.amount : 0),
            Sales_Weed_Mate_Fabrics_Qty: Weed_Mat_Black ? Weed_Mat_Black.outwardQty : 0,
            Sales_Weed_Mate_Fabrics_Value: Weed_Mat_Black ? Weed_Mat_Black.amount : 0,
            Sales_PP_Woven_Sacks_Qty: PP_Woven_Sacks ? PP_Woven_Sacks.outwardQty : 0,
            Sales_PP_Woven_Sacks_Value: PP_Woven_Sacks ? PP_Woven_Sacks.amount : 0,
            Purchase_MSN_Qty: Math.round((Receipts_Mono_Shade ? Receipts_Mono_Shade.receiptsMonoShade : 0) + 479),
            Purchase_PP_Sacks_Qty: Math.round(PPSPurchase ? PPSPurchase.kgs : 0),
            Purchase_PP_Sacks_Value: PPSPurchase ? PPSPurchase.value : 0,
            Purchase_TSN_Qty: Purchase_TSN ? Purchase_TSN.kgs : 0,
            Purchase_TSN_Value: Math.round(Purchase_TSN ? Purchase_TSN.value : 0),
        };

        // Prepare data for Excel
        const monthHeader = req.query.month;
        const calculateRate = (value, qty) => qty !== 0 && value !== "" ? (value / qty).toFixed(2) : "";

        const tradingPlExcelData = [
            ["Sales Accounts", "", "", ""],
            ["Sales-Mulch Film Fabric", "", "", ""],
            ["Sales-Mono Shade Net", trading_pl.Sales_Mono_Shade_Net_Qty, trading_pl.Sales_Mono_Shade_Net_Value, calculateRate(trading_pl.Sales_Mono_Shade_Net_Value, trading_pl.Sales_Mono_Shade_Net_Qty)],
            ["Sales-PP Woven Fabrics", "", "", ""],
            ["Sales-Tape Shade Net", trading_pl.Sales_Tape_Shade_Net_Qty, trading_pl.Sales_Tape_Shade_Net_Value, calculateRate(trading_pl.Sales_Tape_Shade_Net_Value, trading_pl.Sales_Tape_Shade_Net_Qty)],
            ["Sales-Weed Mate Fabrics", trading_pl.Sales_Weed_Mate_Fabrics_Qty, trading_pl.Sales_Weed_Mate_Fabrics_Value, calculateRate(trading_pl.Sales_Weed_Mate_Fabrics_Value, trading_pl.Sales_Weed_Mate_Fabrics_Qty)],
            ["Sales-PP Woven Sacks", trading_pl.Sales_PP_Woven_Sacks_Qty, trading_pl.Sales_PP_Woven_Sacks_Value, calculateRate(trading_pl.Sales_PP_Woven_Sacks_Value, trading_pl.Sales_PP_Woven_Sacks_Qty)],
            ["Opening Stock", "", "", ""],
            ["Add Purchase", "", "", ""],
            ["Add: Purchase MSN", trading_pl.Purchase_MSN_Qty, "", ""],
            ["Add: Purchase PP Sacks", trading_pl.Purchase_PP_Sacks_Qty, trading_pl.Purchase_PP_Sacks_Value, calculateRate(trading_pl.Purchase_PP_Sacks_Value, trading_pl.Purchase_PP_Sacks_Qty)],
            ["Add: Purchase TSN", trading_pl.Purchase_TSN_Qty, trading_pl.Purchase_TSN_Value, calculateRate(trading_pl.Purchase_TSN_Value, trading_pl.Purchase_TSN_Qty)],
            ["Add: Consumption TSN", "", "", ""],
            ["Add: Purchase Others", "", "", ""],
            ["Less: Closing Stock", "", "", ""],
            ["Cost of Sales", "", "", ""],
            ["Conveyance Charges", "", "", ""],
            ["Salary & Wages", "", "", ""],
            ["Commission on Sales", "", "", ""],
            ["Direct Expenses", "", "", ""],
            ["Gross Profit", "", "", ""]
        ];

        // Determine the starting column for the new data
        let startCol = 1; // Default to column B (1-based index, A is 0)
        if (fileExists) {
            const range = xlsx.utils.decode_range(ws['!ref']);
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col });
                if (!ws[cellAddress] || !ws[cellAddress].v) {
                    startCol = col;
                    break;
                }
            }
            if (startCol === 1) {
                startCol = range.e.c + 1;
            }
        }

        // If file doesn't exist, add headers and particulars
        if (!fileExists) {
            const headers = [
                ["Particulars", monthHeader, "", ""],
                ["", "Qty", "Value", "Rate"]
            ];
            xlsx.utils.sheet_add_aoa(ws, headers, { origin: "A1" });
            const particulars = tradingPlExcelData.map(row => [row[0]]);
            xlsx.utils.sheet_add_aoa(ws, particulars, { origin: "A3" });
        } else {
            xlsx.utils.sheet_add_aoa(ws, [[monthHeader, "", ""]], { origin: { r: 0, c: startCol } });
            xlsx.utils.sheet_add_aoa(ws, [["Qty", "Value", "Rate"]], { origin: { r: 1, c: startCol } });
        }

        // Add new data (Qty, Value, Rate) starting from the third row
        let rowIndex = 2; // Start from row 3 (0-based index)
        for (const section of tradingPlExcelData) {
            const dataRow = section.slice(1); // Take Qty, Value, Rate
            xlsx.utils.sheet_add_aoa(ws, [dataRow], { origin: { r: rowIndex, c: startCol } });
            rowIndex++;
        }

        // Set column widths
        ws['!cols'] = ws['!cols'] || [];
        for (let i = 0; i < startCol + 4; i++) {
            ws['!cols'][i] = ws['!cols'][i] || { wch: i === 0 ? 25 : 15 };
        }

        // Add or update worksheet in workbook
        if (!fileExists) {
            xlsx.utils.book_append_sheet(wb, ws, "TradingPL");
        }

        // Write the file
        xlsx.writeFile(wb, filePath);
        console.log(`📊 Excel file updated: ${filePath}`);

        await prisma.tradingPl.upsert({
            where: { time_id: timeRecord.id },
            update: { ...trading_pl },
            create: { time_id: timeRecord.id, ...trading_pl },
        });
        console.log('📊 TradingPl Data upserted:', trading_pl);

        return res.json({ message: 'Successfully created trading PL and generated Excel file', file: filePath });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// app.get("/pal2", async (req, res) => {
//     try {
//         const month = req.query.month

//         const date = parseExcelDate(month);

//         const timeRecord = await prisma.timeRecord.findUnique({
//             where: {
//                 time: date,
//             },
//         });

//         console.log(timeRecord);

//         if (!timeRecord) {
//             return res.status(404).json({ message: 'Time record not found for the given date' });
//         }

//         const oneMonthBackRecord = await prisma.timeRecord.findFirst({
//             where: {
//                 time: new Date(date.setMonth(date.getMonth() - 1)),
//             }
//         });

//         if (!oneMonthBackRecord) {
//             return res.status(404).json({ message: 'Time record not found for the previous month' });
//         }

//         const opstock = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: oneMonthBackRecord.id,
//                 AND: {
//                     material_type: {
//                         in: ["hdpeGranules", "masterBatches", "colourPigments"]
//                     }
//                 }
//             }
//         });

//         const Pal1 = await prisma.Pal1.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         })

//         const clstock = await prisma.stockValuation.findMany({
//             where: {
//                 time_id: timeRecord.id,
//                 AND: {
//                     material_type: {
//                         in: ["hdpeGranules", "masterBatches", "colourPigments"]
//                     }
//                 }
//             }
//         });

//         const Sale_of_Asset_Etc = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "Sale of Asset Etc"
//             }
//         });

//         const Raw_Material = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "Raw Material"
//             }
//         })

//         const HDPE_Monofilament_Waste = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "HDPE Monofilament Waste"
//             }
//         })

//         const Trading_SaleS = await prisma.TradingPl.findFirst({
//             where: {
//                 time_id: timeRecord.id
//             }
//         })

//         console.log(Pal1);


//         const pal2Data = {
//             openingStock: opstock.reduce((acc, item) => acc + item.qty, 0),
//             openingStockValue: opstock.reduce((acc, item) => acc + item.value, 0),

//             Purchase_RM_Qty: Pal1 ? Pal1.purchaseRm : 0,
//             Purchase_RM_Value: Pal1 ? Pal1.purchaseRmValue : 0,

//             Purchase_Trading_Qty: Math.round(Pal1 ? Pal1.purchaseTrading : 0),
//             Purchase_Trading_Value: Math.round(Pal1 ? Pal1.purchaseTradingValue : 0),

//             Purchase_consumable_Qty: Math.round(Pal1 ? Pal1.purchaseConsumables : 0),
//             Purchase_consumable_Value: Math.round(Pal1 ? Pal1.purchaseConsumablesValue : 0),

//             closingStock: clstock.reduce((acc, item) => acc + item.qty, 0),
//             closingStockValue: clstock.reduce((acc, item) => acc + item.value, 0),

//             HD_Sale_Qty: Math.round((Sale_of_Asset_Etc ? Sale_of_Asset_Etc.outwardQty : 0) + (Raw_Material ? Raw_Material.outwardQty : 0)),
//             HD_Sale_Value: Math.round((Sale_of_Asset_Etc ? Sale_of_Asset_Etc.amount : 0) + (Raw_Material ? Raw_Material.amount : 0)),

//             Trading_SaleS_Qty: Math.round((Trading_SaleS ? Trading_SaleS.Sales_Mono_Shade_Net_Qty : 0) + (Trading_SaleS ? Trading_SaleS.Sales_Tape_Shade_Net_Qty : 0) + (Trading_SaleS ? Trading_SaleS.Sales_Weed_Mate_Fabrics_Qty : 0) + (Trading_SaleS ? Trading_SaleS.Sales_PP_Woven_Sacks_Qty : 0)),
//             Trading_SaleS_Value: Math.round((Trading_SaleS ? Trading_SaleS.Sales_Mono_Shade_Net_Value : 0) + (Trading_SaleS ? Trading_SaleS.Sales_Tape_Shade_Net_Value : 0) + (Trading_SaleS ? Trading_SaleS.Sales_Weed_Mate_Fabrics_Value : 0) + (Trading_SaleS ? Trading_SaleS.Sales_PP_Woven_Sacks_Value : 0)),

//             Monofil_Trading_Qty: Math.round(Pal1 ? Pal1.purchaseConsumables : 0),
//             Monofil_Trading_Value: Math.round(Math.round(Pal1 ? Pal1.purchaseConsumables : 0) * 248.96),

//             // Diff_SFG_FG -- pending

//             GST_Refund_Qty: 0,
//             GST_Refund_Value: 0,

//             waste_Qty: HDPE_Monofilament_Waste ? HDPE_Monofilament_Waste.outwardQty : 0,
//             waste_Value: HDPE_Monofilament_Waste ? HDPE_Monofilament_Waste.amount : 0,

//             // Othr_Inc_Qty: Math.round(Pal1 ? Pal1.otherInc : 0),
//             Othr_Inc_Value: Math.round(Pal1 ? Pal1.otherInc : 0),

//             // Trading_Expns_Value -- pending

//             // Direct_Expns     -- pending

//             In_House_Fabrn_Qty: Pal1 ? Pal1.inHouseFabricationQty : 0,
//             In_House_Fabrn_Value: Pal1 ? Pal1.inHouseFabricationValue : 0,

//             Fabrication_Qty: Pal1 ? Pal1.fabricationQty : 0,
//             Fabrication_Value: Pal1 ? Pal1.fabricationValue : 0,

//             // SVE_HBSS  -- empty

//             // Admn_Value

//             //Selling

//             Deprecition_value: Pal1 ? Pal1.deprecation : 0

//             // W Cap Int

//             // Term Loan  --empty

//         }


//         pal2Data.Monofil_Sales_Qty = Math.round(Math.round(Pal1 ? Pal1.sales : 0) - (pal2Data.HD_Sale_Qty + pal2Data.Trading_SaleS_Qty + pal2Data.Monofil_Trading_Qty));
//         pal2Data.Monofil_Sales_Value = Math.round(Math.round(Pal1 ? Pal1.salesValue : 0) - (pal2Data.HD_Sale_Value + pal2Data.Trading_SaleS_Value + pal2Data.Monofil_Trading_Value));

//         console.log('📊 PAL2 Data:', pal2Data);

//         const wb = xlsx.utils.book_new();
//         const ws = xlsx.utils.json_to_sheet([], { skipHeader: true }); // Start with an empty sheet

//         // Define the header row using req.query.month
//         const monthHeader = req.query.month; // Use the month from query param
//         const headers = [
//             ["Particulars", monthHeader, "", "", ""], // Empty cells for alignment
//             ["", "Cost %", "Qty", "Value", "Rate"] // Column headers
//         ];

//         // Helper function to calculate rate (value/qty) and handle division by zero
//         const calculateRate = (value, qty) => qty !== 0 && value !== "" ? (value / qty).toFixed(2) : "";

//         // Helper function to calculate Cost % (value/totalSales * 100)
//         const calculateCostPercentage = (value, total) => total !== 0 && value !== "" ? Math.round((value / total) * 100) + "%" : "";

//         // Calculate Total Sales for Cost % base
//         const totalSales = (pal2Data.HD_Sale_Value || 0) + (pal2Data.Trading_SaleS_Value || 0) + (pal2Data.Monofil_Trading_Value || 0) + (pal2Data.Monofil_Sales_Value || 0);

//         // Calculate individual Cost % for expense/income items
//         const directExpnsCostPercentage = 0; // Pending, will be 0% for now
//         const tradingExpnsCostPercentage = 0; // Pending, will be 0% for now
//         const inHouseFabrnCostPercentage = calculateCostPercentage(pal2Data.In_House_Fabrn_Value, totalSales);
//         const fabricationCostPercentage = calculateCostPercentage(pal2Data.Fabrication_Value, totalSales);
//         const directCostPercentage = parseInt(inHouseFabrnCostPercentage || 0) + parseInt(fabricationCostPercentage || 0); // Sum of Direct Expns, Trading Expns, In House Fabrn, Fabrication

//         const sveHbssCostPercentage = 0; // Empty, will be 0% for now
//         const adminCostPercentage = 0; // Empty, will be 0% for now
//         const sellingCostPercentage = 0; // Empty, will be 0% for now
//         const totalAdminCostPercentage = parseInt(sveHbssCostPercentage || 0) + parseInt(adminCostPercentage || 0) + parseInt(sellingCostPercentage || 0);

//         const depreciationCostPercentage = calculateCostPercentage(pal2Data.Deprecition_value, totalSales);
//         const wCapIntCostPercentage = 0; // Empty, will be 0% for now
//         const termLoanCostPercentage = 0; // Empty, will be 0% for now
//         const covidIntCostPercentage = 0; // Empty, will be 0% for now
//         const intOnOthersCostPercentage = 0; // Empty, will be 0% for now
//         const finCostPercentage = parseInt(depreciationCostPercentage || 0) + parseInt(wCapIntCostPercentage || 0) + parseInt(termLoanCostPercentage || 0) + parseInt(covidIntCostPercentage || 0) + parseInt(intOnOthersCostPercentage || 0);
//         const depnAndIntCostPercentage = finCostPercentage;

//         const totalExpnsCostPercentage = directCostPercentage + totalAdminCostPercentage + finCostPercentage;

//         // PAL2 Data for Excel (restructured to match the image with dynamic Cost %)
//         const pal2ExcelData = [
//             ["Op Stk RM Only", calculateCostPercentage(pal2Data.openingStockValue, totalSales), pal2Data.openingStock, pal2Data.openingStockValue, calculateRate(pal2Data.openingStockValue, pal2Data.openingStock)],
//             ["Purchase RM", "", pal2Data.Purchase_RM_Qty, pal2Data.Purchase_RM_Value, calculateRate(pal2Data.Purchase_RM_Value, pal2Data.Purchase_RM_Qty)],
//             ["Purchase Trading", "", pal2Data.Purchase_Trading_Qty, pal2Data.Purchase_Trading_Value, calculateRate(pal2Data.Purchase_Trading_Value, pal2Data.Purchase_Trading_Qty)],
//             ["Purchase Consumable", "", pal2Data.Purchase_consumable_Qty, pal2Data.Purchase_consumable_Value, calculateRate(pal2Data.Purchase_consumable_Value, pal2Data.Purchase_consumable_Qty)],
//             ["Cl Stk RM Only", "", pal2Data.closingStock, pal2Data.closingStockValue, calculateRate(pal2Data.closingStockValue, pal2Data.closingStock)],
//             ["HD Sale", "", pal2Data.HD_Sale_Qty, pal2Data.HD_Sale_Value, calculateRate(pal2Data.HD_Sale_Value, pal2Data.HD_Sale_Qty)],
//             ["Trading Sales", "", pal2Data.Trading_SaleS_Qty, pal2Data.Trading_SaleS_Value, calculateRate(pal2Data.Trading_SaleS_Value, pal2Data.Trading_SaleS_Qty)],
//             ["Monofil Trading", "", pal2Data.Monofil_Trading_Qty, pal2Data.Monofil_Trading_Value, calculateRate(pal2Data.Monofil_Trading_Value, pal2Data.Monofil_Trading_Qty)],
//             ["Monofil Sales", "", pal2Data.Monofil_Sales_Qty, pal2Data.Monofil_Sales_Value, calculateRate(pal2Data.Monofil_Sales_Value, pal2Data.Monofil_Sales_Qty)],
//             ["Total Sales", "", "", totalSales, ""], // Total calculated dynamically
//             ["Diff SFG/FG", "", "", "", ""], // Pending, left empty
//             ["GST Refund", "", pal2Data.GST_Refund_Qty, pal2Data.GST_Refund_Value, calculateRate(pal2Data.GST_Refund_Value, pal2Data.GST_Refund_Qty)],
//             ["Waste", "", pal2Data.waste_Qty, pal2Data.waste_Value, calculateRate(pal2Data.waste_Value, pal2Data.waste_Qty)],
//             ["Othr Inc", calculateCostPercentage(pal2Data.Othr_Inc_Value, totalSales), "", pal2Data.Othr_Inc_Value, ""], // No Qty for Other Income
//             ["Direct Expns", directExpnsCostPercentage + "%", "", "", ""], // Pending, left empty
//             ["Trading Expns", tradingExpnsCostPercentage + "%", "", "", ""], // Pending, left empty
//             ["In House Fabrn", inHouseFabrnCostPercentage, pal2Data.In_House_Fabrn_Qty, pal2Data.In_House_Fabrn_Value, calculateRate(pal2Data.In_House_Fabrn_Value, pal2Data.In_House_Fabrn_Qty)],
//             ["Fabrication", fabricationCostPercentage, pal2Data.Fabrication_Qty, pal2Data.Fabrication_Value, calculateRate(pal2Data.Fabrication_Value, pal2Data.Fabrication_Qty)],
//             ["DIRECT COST", directCostPercentage + "%", "", "", ""], // Sum of percentages
//             ["SVE-HBSS", sveHbssCostPercentage + "%", "", "", ""], // Empty, left empty
//             ["Admin", adminCostPercentage + "%", "", "", ""], // Empty, left empty
//             ["Selling", sellingCostPercentage + "%", "", "", ""], // Empty, left empty
//             ["TOTAL", totalAdminCostPercentage + "%", "", "", ""], // Sum of percentages
//             ["EBITDA", "", "", "", ""], // Calculated, left empty
//             ["Depreciation", depreciationCostPercentage, "", pal2Data.Deprecition_value, ""], // No Qty for Depreciation
//             ["W Cap Int", wCapIntCostPercentage + "%", "", "", ""], // Empty, left empty
//             ["Term Loan", termLoanCostPercentage + "%", "", "", ""], // Empty, left empty
//             ["Covid Int", covidIntCostPercentage + "%", "", "", ""], // Empty, left empty
//             ["Int On Others", intOnOthersCostPercentage + "%", "", "", ""], // Empty, left empty
//             ["FIN Cost", finCostPercentage + "%", "", "", ""], // Sum of percentages
//             ["Depn & INT", depnAndIntCostPercentage + "%", "", "", ""], // Sum of percentages
//             ["Total Expns", totalExpnsCostPercentage + "%", "", "", ""], // Sum of percentages
//             ["Profit (A)", "", "", "", ""] // Calculated, left empty
//         ];

//         // Combine headers and data
//         const allData = [
//             ...headers,
//             ...pal2ExcelData
//         ];

//         // Append all data to the worksheet
//         xlsx.utils.sheet_add_aoa(ws, allData, { origin: "A1" });

//         // Set column widths (optional)
//         ws['!cols'] = [
//             { wch: 15 }, // Particulars
//             { wch: 10 }, // Cost %
//             { wch: 15 }, // Qty
//             { wch: 15 }, // Value
//             { wch: 15 }  // Rate
//         ];

//         // Add the worksheet to the workbook
//         xlsx.utils.book_append_sheet(wb, ws, "PAL2");

//         // Write the file
//         const filePath = `./PAL2_${monthHeader}.xlsx`;
//         xlsx.writeFile(wb, filePath);

//         console.log(`📊 Excel file generated: ${filePath}`);

//         // Upsert PAL2 data into the database (your existing code)
//         await prisma.pal2.upsert({
//             where: { time_id: timeRecord.id },
//             update: { ...pal2Data },
//             create: { time_id: timeRecord.id, ...pal2Data },
//         });
//         console.log('📊 PAL2 Data upserted:', pal2Data);

//         // Send response
//         return res.json({ message: 'PAL2 data extracted, added, and Excel file generated successfully', file: filePath });

//     } catch (error) {
//         console.error('❌ Error:', error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// }
// );

app.get('/pal2', async (req, res) => {
    try {
        const month = req.query.month;
        console.log(month);
        const date = parseExcelDate(month);
        const filePath = path.join(__dirname, 'PAL2.xlsx'); // Write to data folder
        let wb, ws;

        // Check if the file exists
        const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);

        if (fileExists) {
            // Read existing workbook
            wb = xlsx.readFile(filePath);
            ws = wb.Sheets[wb.SheetNames[0]]; // Assume data is in the first sheet
        } else {
            // Create new workbook and worksheet
            wb = xlsx.utils.book_new();
            ws = xlsx.utils.json_to_sheet([], { skipHeader: true });
        }

        const timeRecord = await prisma.timeRecord.findUnique({
            where: { time: date },
        });

        console.log(timeRecord);

        if (!timeRecord) {
            return res.status(404).json({ message: 'Time record not found for the given date' });
        }

        const oneMonthBackRecord = await prisma.timeRecord.findFirst({
            where: { time: new Date(date.setMonth(date.getMonth() - 1)) },
        });

        if (!oneMonthBackRecord) {
            return res.status(404).json({ message: 'Time record not found for the previous month' });
        }

        const opstock = await prisma.stockValuation.findMany({
            where: {
                time_id: oneMonthBackRecord.id,
                AND: {
                    material_type: {
                        in: ["hdpeGranules", "masterBatches", "colourPigments"]
                    }
                }
            }
        });

        const Pal1 = await prisma.Pal1.findUnique({
            where: { time_id: timeRecord.id },
        });

        const clstock = await prisma.stockValuation.findMany({
            where: {
                time_id: timeRecord.id,
                AND: {
                    material_type: {
                        in: ["hdpeGranules", "masterBatches", "colourPigments"]
                    }
                }
            }
        });

        const Sale_of_Asset_Etc = await prisma.inventoryDetails.findFirst({
            where: { time_id: timeRecord.id, materialName: "Sale of Asset Etc" },
        });

        const Raw_Material = await prisma.inventoryDetails.findFirst({
            where: { time_id: timeRecord.id, materialName: "Raw Material" },
        });

        const HDPE_Monofilament_Waste = await prisma.inventoryDetails.findFirst({
            where: { time_id: timeRecord.id, materialName: "HDPE Monofilament Waste" },
        });

        const Trading_SaleS = await prisma.TradingPl.findFirst({
            where: { time_id: timeRecord.id },
        });

        console.log(Pal1);

        const pal2Data = {
            openingStock: opstock.reduce((acc, item) => acc + item.qty, 0),
            openingStockValue: opstock.reduce((acc, item) => acc + item.value, 0),
            Purchase_RM_Qty: Pal1 ? Pal1.purchaseRm : 0,
            Purchase_RM_Value: Pal1 ? Pal1.purchaseRmValue : 0,
            Purchase_Trading_Qty: Math.round(Pal1 ? Pal1.purchaseTrading : 0),
            Purchase_Trading_Value: Math.round(Pal1 ? Pal1.purchaseTradingValue : 0),
            Purchase_consumable_Qty: Math.round(Pal1 ? Pal1.purchaseConsumables : 0),
            Purchase_consumable_Value: Math.round(Pal1 ? Pal1.purchaseConsumablesValue : 0),
            closingStock: clstock.reduce((acc, item) => acc + item.qty, 0),
            closingStockValue: clstock.reduce((acc, item) => acc + item.value, 0),
            HD_Sale_Qty: Math.round((Sale_of_Asset_Etc ? Sale_of_Asset_Etc.outwardQty : 0) + (Raw_Material ? Raw_Material.outwardQty : 0)),
            HD_Sale_Value: Math.round((Sale_of_Asset_Etc ? Sale_of_Asset_Etc.amount : 0) + (Raw_Material ? Raw_Material.amount : 0)),
            Trading_SaleS_Qty: Math.round((Trading_SaleS ? Trading_SaleS.Sales_Mono_Shade_Net_Qty : 0) + (Trading_SaleS ? Trading_SaleS.Sales_Tape_Shade_Net_Qty : 0) + (Trading_SaleS ? Trading_SaleS.Sales_Weed_Mate_Fabrics_Qty : 0) + (Trading_SaleS ? Trading_SaleS.Sales_PP_Woven_Sacks_Qty : 0)),
            Trading_SaleS_Value: Math.round((Trading_SaleS ? Trading_SaleS.Sales_Mono_Shade_Net_Value : 0) + (Trading_SaleS ? Trading_SaleS.Sales_Tape_Shade_Net_Value : 0) + (Trading_SaleS ? Trading_SaleS.Sales_Weed_Mate_Fabrics_Value : 0) + (Trading_SaleS ? Trading_SaleS.Sales_PP_Woven_Sacks_Value : 0)),
            Monofil_Trading_Qty: Math.round(Pal1 ? Pal1.purchaseConsumables : 0),
            Monofil_Trading_Value: Math.round(Math.round(Pal1 ? Pal1.purchaseConsumables : 0) * 248.96),
            GST_Refund_Qty: 0,
            GST_Refund_Value: 0,
            waste_Qty: HDPE_Monofilament_Waste ? HDPE_Monofilament_Waste.outwardQty : 0,
            waste_Value: HDPE_Monofilament_Waste ? HDPE_Monofilament_Waste.amount : 0,
            Othr_Inc_Value: Math.round(Pal1 ? Pal1.otherInc : 0),
            In_House_Fabrn_Qty: Pal1 ? Pal1.inHouseFabricationQty : 0,
            In_House_Fabrn_Value: Pal1 ? Pal1.inHouseFabricationValue : 0,
            Fabrication_Qty: Pal1 ? Pal1.fabricationQty : 0,
            Fabrication_Value: Pal1 ? Pal1.fabricationValue : 0,
            Deprecition_value: Pal1 ? Pal1.deprecation : 0
        };

        pal2Data.Monofil_Sales_Qty = Math.round(Math.round(Pal1 ? Pal1.sales : 0) - (pal2Data.HD_Sale_Qty + pal2Data.Trading_SaleS_Qty + pal2Data.Monofil_Trading_Qty));
        pal2Data.Monofil_Sales_Value = Math.round(Math.round(Pal1 ? Pal1.salesValue : 0) - (pal2Data.HD_Sale_Value + pal2Data.Trading_SaleS_Value + pal2Data.Monofil_Trading_Value));

        console.log('📊 PAL2 Data:', pal2Data);

        // Prepare data for Excel
        const monthHeader = req.query.month;
        const calculateRate = (value, qty) => qty !== 0 && value !== "" ? (value / qty).toFixed(2) : "";
        const calculateCostPercentage = (value, total) => total !== 0 && value !== "" ? Math.round((value / total) * 100) + "%" : "";

        const totalSales = (pal2Data.HD_Sale_Value || 0) + (pal2Data.Trading_SaleS_Value || 0) + (pal2Data.Monofil_Trading_Value || 0) + (pal2Data.Monofil_Sales_Value || 0);

        const directExpnsCostPercentage = 0;
        const tradingExpnsCostPercentage = 0;
        const inHouseFabrnCostPercentage = calculateCostPercentage(pal2Data.In_House_Fabrn_Value, totalSales);
        const fabricationCostPercentage = calculateCostPercentage(pal2Data.Fabrication_Value, totalSales);
        const directCostPercentage = parseInt(inHouseFabrnCostPercentage || 0) + parseInt(fabricationCostPercentage || 0);
        const sveHbssCostPercentage = 0;
        const adminCostPercentage = 0;
        const sellingCostPercentage = 0;
        const totalAdminCostPercentage = parseInt(sveHbssCostPercentage || 0) + parseInt(adminCostPercentage || 0) + parseInt(sellingCostPercentage || 0);
        const depreciationCostPercentage = calculateCostPercentage(pal2Data.Deprecition_value, totalSales);
        const wCapIntCostPercentage = 0;
        const termLoanCostPercentage = 0;
        const covidIntCostPercentage = 0;
        const intOnOthersCostPercentage = 0;
        const finCostPercentage = parseInt(depreciationCostPercentage || 0) + parseInt(wCapIntCostPercentage || 0) + parseInt(termLoanCostPercentage || 0) + parseInt(covidIntCostPercentage || 0) + parseInt(intOnOthersCostPercentage || 0);
        const depnAndIntCostPercentage = finCostPercentage;
        const totalExpnsCostPercentage = directCostPercentage + totalAdminCostPercentage + finCostPercentage;

        const pal2ExcelData = [
            ["Op Stk RM Only", calculateCostPercentage(pal2Data.openingStockValue, totalSales), pal2Data.openingStock, pal2Data.openingStockValue, calculateRate(pal2Data.openingStockValue, pal2Data.openingStock)],
            ["Purchase RM", "", pal2Data.Purchase_RM_Qty, pal2Data.Purchase_RM_Value, calculateRate(pal2Data.Purchase_RM_Value, pal2Data.Purchase_RM_Qty)],
            ["Purchase Trading", "", pal2Data.Purchase_Trading_Qty, pal2Data.Purchase_Trading_Value, calculateRate(pal2Data.Purchase_Trading_Value, pal2Data.Purchase_Trading_Qty)],
            ["Purchase Consumable", "", pal2Data.Purchase_consumable_Qty, pal2Data.Purchase_consumable_Value, calculateRate(pal2Data.Purchase_consumable_Value, pal2Data.Purchase_consumable_Qty)],
            ["Cl Stk RM Only", "", pal2Data.closingStock, pal2Data.closingStockValue, calculateRate(pal2Data.closingStockValue, pal2Data.closingStock)],
            ["HD Sale", "", pal2Data.HD_Sale_Qty, pal2Data.HD_Sale_Value, calculateRate(pal2Data.HD_Sale_Value, pal2Data.HD_Sale_Qty)],
            ["Trading Sales", "", pal2Data.Trading_SaleS_Qty, pal2Data.Trading_SaleS_Value, calculateRate(pal2Data.Trading_SaleS_Value, pal2Data.Trading_SaleS_Qty)],
            ["Monofil Trading", "", pal2Data.Monofil_Trading_Qty, pal2Data.Monofil_Trading_Value, calculateRate(pal2Data.Monofil_Trading_Value, pal2Data.Monofil_Trading_Qty)],
            ["Monofil Sales", "", pal2Data.Monofil_Sales_Qty, pal2Data.Monofil_Sales_Value, calculateRate(pal2Data.Monofil_Sales_Value, pal2Data.Monofil_Sales_Qty)],
            ["Total Sales", "", "", totalSales, ""],
            ["Diff SFG/FG", "", "", "", ""],
            ["GST Refund", "", pal2Data.GST_Refund_Qty, pal2Data.GST_Refund_Value, calculateRate(pal2Data.GST_Refund_Value, pal2Data.GST_Refund_Qty)],
            ["Waste", "", pal2Data.waste_Qty, pal2Data.waste_Value, calculateRate(pal2Data.waste_Value, pal2Data.waste_Qty)],
            ["Othr Inc", calculateCostPercentage(pal2Data.Othr_Inc_Value, totalSales), "", pal2Data.Othr_Inc_Value, ""],
            ["Direct Expns", directExpnsCostPercentage + "%", "", "", ""],
            ["Trading Expns", tradingExpnsCostPercentage + "%", "", "", ""],
            ["In House Fabrn", inHouseFabrnCostPercentage, pal2Data.In_House_Fabrn_Qty, pal2Data.In_House_Fabrn_Value, calculateRate(pal2Data.In_House_Fabrn_Value, pal2Data.In_House_Fabrn_Qty)],
            ["Fabrication", fabricationCostPercentage, pal2Data.Fabrication_Qty, pal2Data.Fabrication_Value, calculateRate(pal2Data.Fabrication_Value, pal2Data.Fabrication_Qty)],
            ["DIRECT COST", directCostPercentage + "%", "", "", ""],
            ["SVE-HBSS", sveHbssCostPercentage + "%", "", "", ""],
            ["Admin", adminCostPercentage + "%", "", "", ""],
            ["Selling", sellingCostPercentage + "%", "", "", ""],
            ["TOTAL", totalAdminCostPercentage + "%", "", "", ""],
            ["EBITDA", "", "", "", ""],
            ["Depreciation", depreciationCostPercentage, "", pal2Data.Deprecition_value, ""],
            ["W Cap Int", wCapIntCostPercentage + "%", "", "", ""],
            ["Term Loan", termLoanCostPercentage + "%", "", "", ""],
            ["Covid Int", covidIntCostPercentage + "%", "", "", ""],
            ["Int On Others", intOnOthersCostPercentage + "%", "", "", ""],
            ["FIN Cost", finCostPercentage + "%", "", "", ""],
            ["Depn & INT", depnAndIntCostPercentage + "%", "", "", ""],
            ["Total Expns", totalExpnsCostPercentage + "%", "", "", ""],
            ["Profit (A)", "", "", "", ""]
        ];

        // Determine the starting column for the new data
        let startCol = 1; // Default to column B (1-based index, A is 0)
        if (fileExists) {
            const range = xlsx.utils.decode_range(ws['!ref']);
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col });
                if (!ws[cellAddress] || !ws[cellAddress].v) {
                    startCol = col;
                    break;
                }
            }
            if (startCol === 1) {
                startCol = range.e.c + 1;
            }
        }

        // If file doesn't exist, add headers and particulars
        if (!fileExists) {
            const headers = [
                ["Particulars", monthHeader, "", "", ""],
                ["", "Cost %", "Qty", "Value", "Rate"]
            ];
            xlsx.utils.sheet_add_aoa(ws, headers, { origin: "A1" });
            const particulars = pal2ExcelData.map(row => [row[0]]);
            xlsx.utils.sheet_add_aoa(ws, particulars, { origin: "A3" });
        } else {
            xlsx.utils.sheet_add_aoa(ws, [[monthHeader, "", "", ""]], { origin: { r: 0, c: startCol } });
            xlsx.utils.sheet_add_aoa(ws, [["Cost %", "Qty", "Value", "Rate"]], { origin: { r: 1, c: startCol } });
        }

        // Add new data (Cost %, Qty, Value, Rate) starting from the third row
        let rowIndex = 2; // Start from row 3 (0-based index)
        for (const section of pal2ExcelData) {
            const dataRow = section.slice(1); // Take Cost %, Qty, Value, Rate
            xlsx.utils.sheet_add_aoa(ws, [dataRow], { origin: { r: rowIndex, c: startCol } });
            rowIndex++;
        }

        // Set column widths
        ws['!cols'] = ws['!cols'] || [];
        for (let i = 0; i < startCol + 5; i++) {
            ws['!cols'][i] = ws['!cols'][i] || { wch: i === 0 ? 15 : i === 1 ? 10 : 15 };
        }

        // Add or update worksheet in workbook
        if (!fileExists) {
            xlsx.utils.book_append_sheet(wb, ws, "PAL2");
        }

        // Write the file
        xlsx.writeFile(wb, filePath);
        console.log(`📊 Excel file updated: ${filePath}`);

        // Upsert PAL2 data into the database
        await prisma.pal2.upsert({
            where: { time_id: timeRecord.id },
            update: { ...pal2Data },
            create: { time_id: timeRecord.id, ...pal2Data },
        });
        console.log('📊 PAL2 Data upserted:', pal2Data);

        return res.json({ message: 'PAL2 data extracted, added, and Excel file generated successfully', file: filePath });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// app.get("/finAnalysis", async (req, res) => {
//     try {
//         const month = req.query.month

//         const date = parseExcelDate(month);

//         const timeRecord = await prisma.timeRecord.findUnique({
//             where: {
//                 time: date,
//             },
//         });

//         if (!timeRecord) {
//             return res.status(404).json({ message: 'Time record not found for the given date' });
//         }

//         const oneMonthBackRecord = await prisma.timeRecord.findFirst({
//             where: {
//                 time: new Date(date.setMonth(date.getMonth() - 1)),
//             }
//         });

//         if (!oneMonthBackRecord) {
//             return res.status(404).json({ message: 'Time record not found for the previous month' });
//         }

//         const rmConsumptionCogs = await prisma.rmConsumptionCogs.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const monofil = ((rmConsumptionCogs?.openingStockValue || 0) + (rmConsumptionCogs?.purchaseValue || 0)) - ((rmConsumptionCogs?.salesValue || 0) + (rmConsumptionCogs?.closingStockValue || 0)); //some values are worng or missing refer to the excel g4

//         const mfPurchase = await prisma.monofilCogs.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const sfgOpening = await prisma.monofilSFGnFGOpeningStock.findUnique({
//             where: {
//                 time_id: timeRecord.id,
//             },
//         });

//         const openingValue = sfgOpening ? sfgOpening.sfg_yarn_value + sfgOpening.fg_fabric_value : 0;

//         const sfgClosing = await prisma.monofilSFGnFGClosingStock.findUnique({
//             where: {
//                 time_id: timeRecord.id
//             }
//         });

//         const closingValue = sfgClosing ? sfgClosing.sfg_yarn_value + sfgClosing.fg_fabric_value : 0;


//         const tradingSFGfg = await prisma.tradingCogs.findUnique({
//             where: {
//                 time_id: timeRecord.id
//             }
//         });

//         const rm = await prisma.rmConsumptionCogs.findUnique({
//             where: {
//                 time_id: timeRecord.id
//             }
//         });

//         const pal2 = await prisma.pal2.findUnique({
//             where: {
//                 time_id: timeRecord.id
//             }
//         });

//         const sales = {
//             monofil: (pal2 ? pal2.Monofil_Sales_Value : 0) + (pal2 ? pal2.Monofil_Trading_Value : 0),
//             trading: pal2 ? pal2.Trading_SaleS_Value : 0,
//             rm: pal2 ? pal2.HD_Sale_Value : 0,
//             otherInc: pal2.GST_Refund_Value + pal2.Othr_Inc_Value + pal2.waste_Value,
//         };

//         const consumption = {
//             monofil,
//             mfPurchase: mfPurchase.yarnValue + mfPurchase.purchaseFabricValue + mfPurchase.consumablesPurchase,
//             sfgFG: openingValue - closingValue,

//             // trading: 0, // wait for tradingPL
//             tradingSFGfg: tradingSFGfg.difference_stock_value,
//             rm: rm.salesValue

//         }

//         consumption.totalMonofil = consumption.monofil + consumption.mfPurchase + consumption.sfgFG
//         consumption.totalConsumption = consumption.totalMonofil + consumption.tradingSFGfg + consumption.rm // + trading add after fixing it above

//         console.log('📊 Consumption:', consumption);

//         let s21 = await prisma.variableAndDirect.findUnique({
//             where: {
//                 time_id: timeRecord.id
//             }
//         });

//         s21 = s21 ? Object.keys(s21).reduce((sum, key) => {
//             if (key !== 'id' && key !== 'time_id') {
//                 return sum + (s21[key] || 0);
//             }
//             return sum;
//         }, 0) : 0;

//         let s47 = await prisma.variableAndDirect.findUnique({
//             where: {
//                 time_id: oneMonthBackRecord.id
//             }
//         });


//         s47 = s47 ? s47.wagesFabric + s47.wagesInspectionDispatch + s47.fabricationCharges : 0;



//         const operatingExpenses = {
//             totalVariableAndDirect: s21 - (s47),// + s48)
//             frabic: s47,
//             // trading: //s48
//         }

//         const deprecation = await prisma.fixedExpenses.findUnique({
//             where: {
//                 time_id: timeRecord.id
//             }
//         });

//         const overheads = deprecation
//             ? Object.keys(deprecation).reduce((sum, key) => {
//                 if (key !== 'id' && key !== 'time_id' && key !== 'depreciation') {
//                     return sum + (deprecation[key] || 0);
//                 }
//                 return sum;
//             }, 0)
//             : 0;


//         const fixedExpenses = {
//             deprecation,
//             overheads
//         }

//         //update to database

//         await prisma.sales.upsert({
//             where: { time_id: timeRecord.id },
//             update: {
//                 monofil: sales.monofil,
//                 trading: sales.trading,
//                 rm: sales.rm,
//                 otherInc: sales.otherInc,
//             },
//             create: {
//                 time_id: timeRecord.id,
//                 monofil: sales.monofil,
//                 trading: sales.trading,
//                 rm: sales.rm,
//                 otherInc: sales.otherInc,
//             },
//         });

//         await prisma.consumption.upsert({
//             where: { time_id: timeRecord.id },
//             update: {
//                 monofil: consumption.monofil,
//                 mfPurchase: consumption.mfPurchase,
//                 sfgFG: consumption.sfgFG,
//                 tradingSFGfg: consumption.tradingSFGfg,
//                 rm: consumption.rm,
//                 totalMonofil: consumption.totalMonofil,
//                 totalConsumption: consumption.totalConsumption,
//             },
//             create: {
//                 time_id: timeRecord.id,
//                 monofil: consumption.monofil,
//                 mfPurchase: consumption.mfPurchase,
//                 sfgFG: consumption.sfgFG,
//                 tradingSFGfg: consumption.tradingSFGfg,
//                 rm: consumption.rm,
//                 totalMonofil: consumption.totalMonofil,
//                 totalConsumption: consumption.totalConsumption,
//             },
//         });

//         await prisma.operatingExpenses.upsert({
//             where: { time_id: timeRecord.id },
//             update: {
//                 totalVariableAndDirect: operatingExpenses.totalVariableAndDirect,
//                 frabic: operatingExpenses.frabic,
//             },
//             create: {
//                 time_id: timeRecord.id,
//                 totalVariableAndDirect: operatingExpenses.totalVariableAndDirect,
//                 frabic: operatingExpenses.frabic,
//             },
//         });

//         await prisma.fixedExpenses.upsert({
//             where: { time_id: timeRecord.id },
//             update: {
//                 depreciation: fixedExpenses.deprecation?.depreciation || 0,
//                 overheads: fixedExpenses.overheads,
//             },
//             create: {
//                 time_id: timeRecord.id,
//                 depreciation: fixedExpenses.deprecation?.depreciation || 0,
//                 overheads: fixedExpenses.overheads,
//             },
//         });
//         const wb = xlsx.utils.book_new();
//         const ws = xlsx.utils.json_to_sheet([], { skipHeader: true }); // Start with an empty sheet

//         // Define the header row using req.query.month
//         const currentMonth = req.query.month; // Renamed to avoid conflict with outer scope

//         // Headers based on the provided image
//         const headers = [
//             ["Month", "Monofil", "Trading", "Sales", "RM Sales", "Total", "Othr Inc", "Monofil", "%age", "MF Purchase", "SFG/FG", "Total Monofil", "%age", "Trading", "SFG/FG", "RM", "Total Consm", "%age", "Yarn", "%age", "Fabric", "%age", "Trading", "Operating Expenses", "%age", "OP Profit", "Depreciation", "%age", "Overheads", "%age", "NET"]
//         ];

//         // Calculate percentages on the fly
//         const calculatePercentage = (value, total) => total !== 0 && value !== "" ? ((value / total) * 100).toFixed(2) + "%" : "";

//         // Split Fixed Expenses into Depreciation and Overheads
//         const depreciationValue = fixedExpenses.deprecation?.depreciation || 0;
//         const overheadsValue = fixedExpenses.overheads || 0;

//         // Data row using existing calculated values
//         const dataRow = [
//             currentMonth,
//             consumption.monofil, // Monofil
//             consumption.tradingSFGfg, // Trading (using tradingSFGfg as proxy since trading is missing)
//             sales.trading, // Sales (from pal2 trading sales)
//             sales.rm, // RM Sales
//             "", // Total (depends on sales and trading, left empty)
//             sales.otherInc, // Othr Inc
//             consumption.monofil, // Monofil
//             calculatePercentage(consumption.monofil, consumption.totalConsumption), // %age
//             consumption.mfPurchase, // MF Purchase
//             consumption.sfgFG, // SFG/FG
//             consumption.totalMonofil, // Total Monofil
//             calculatePercentage(consumption.totalMonofil, consumption.totalConsumption), // %age
//             "", // Trading (pending breakdown)
//             consumption.tradingSFGfg, // SFG/FG
//             consumption.rm, // RM
//             consumption.totalConsumption, // Total Consm
//             calculatePercentage(consumption.totalConsumption, consumption.totalConsumption) || "100%", // %age
//             "", // Yarn (not broken down)
//             "", // %age
//             "", // Fabric (not broken down)
//             "", // %age
//             "", // Trading (pending)
//             operatingExpenses.totalVariableAndDirect, // Operating Expenses
//             calculatePercentage(operatingExpenses.totalVariableAndDirect, consumption.totalConsumption), // %age
//             "", // OP Profit (depends on sales, left empty)
//             depreciationValue, // Depreciation
//             calculatePercentage(depreciationValue, consumption.totalConsumption), // %age
//             overheadsValue, // Overheads
//             calculatePercentage(overheadsValue, consumption.totalConsumption), // %age
//             "" // NET (depends on OP Profit, left empty)
//         ];

//         // Combine headers and data
//         const allData = [
//             ...headers,
//             dataRow
//         ];

//         // Append all data to the worksheet
//         xlsx.utils.sheet_add_aoa(ws, allData, { origin: "A1" });

//         // Set column widths (optional)
//         ws['!cols'] = [
//             { wch: 10 }, // Month
//             { wch: 12 }, // Monofil
//             { wch: 12 }, // Trading
//             { wch: 12 }, // Sales
//             { wch: 12 }, // RM Sales
//             { wch: 12 }, // Total
//             { wch: 12 }, // Othr Inc
//             { wch: 12 }, // Monofil
//             { wch: 8 },  // %age
//             { wch: 12 }, // MF Purchase
//             { wch: 12 }, // SFG/FG
//             { wch: 12 }, // Total Monofil
//             { wch: 8 },  // %age
//             { wch: 12 }, // Trading
//             { wch: 12 }, // SFG/FG
//             { wch: 12 }, // RM
//             { wch: 12 }, // Total Consm
//             { wch: 8 },  // %age
//             { wch: 12 }, // Yarn
//             { wch: 8 },  // %age
//             { wch: 12 }, // Fabric
//             { wch: 8 },  // %age
//             { wch: 12 }, // Trading
//             { wch: 12 }, // Operating Expenses
//             { wch: 8 },  // %age
//             { wch: 12 }, // OP Profit
//             { wch: 12 }, // Depreciation
//             { wch: 8 },  // %age
//             { wch: 12 }, // Overheads
//             { wch: 8 },  // %age
//             { wch: 12 }  // NET
//         ];

//         // Add the worksheet to the workbook
//         xlsx.utils.book_append_sheet(wb, ws, "FinAnalysis");

//         // Write the file
//         const filePath = `./FinAnalysis_${currentMonth}.xlsx`;
//         xlsx.writeFile(wb, filePath);

//         console.log(`📊 Excel file generated: ${filePath}`);

//         // Send response
//         res.status(200).json({ message: 'Financial Analysis data extracted, added, and Excel file generated successfully', file: filePath });
//     } catch (error) {
//         console.error('❌ Error:', error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

app.get('/finAnalysis', async (req, res) => {
    try {
        const month = req.query.month;
        const date = parseExcelDate(month);
        const filePath = path.join(__dirname, 'FinAnalysis.xlsx'); // Write to data folder
        let wb, ws;

        // Check if the file exists
        const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);

        if (fileExists) {
            // Read existing workbook
            wb = xlsx.readFile(filePath);
            ws = wb.Sheets[wb.SheetNames[0]]; // Assume data is in the first sheet
        } else {
            // Create new workbook and worksheet
            wb = xlsx.utils.book_new();
            ws = xlsx.utils.json_to_sheet([], { skipHeader: true });
        }

        const timeRecord = await prisma.timeRecord.findUnique({
            where: { time: date },
        });

        if (!timeRecord) {
            return res.status(404).json({ message: 'Time record not found for the given date' });
        }

        const oneMonthBackRecord = await prisma.timeRecord.findFirst({
            where: { time: new Date(date.setMonth(date.getMonth() - 1)) },
        });

        if (!oneMonthBackRecord) {
            return res.status(404).json({ message: 'Time record not found for the previous month' });
        }

        const rmConsumptionCogs = await prisma.rmConsumptionCogs.findUnique({
            where: { time_id: timeRecord.id },
        });

        const monofil = ((rmConsumptionCogs?.openingStockValue || 0) + (rmConsumptionCogs?.purchaseValue || 0)) - ((rmConsumptionCogs?.salesValue || 0) + (rmConsumptionCogs?.closingStockValue || 0));

        const mfPurchase = await prisma.monofilCogs.findUnique({
            where: { time_id: timeRecord.id },
        });

        const sfgOpening = await prisma.monofilSFGnFGOpeningStock.findUnique({
            where: { time_id: timeRecord.id },
        });

        const openingValue = sfgOpening ? sfgOpening.sfg_yarn_value + sfgOpening.fg_fabric_value : 0;

        const sfgClosing = await prisma.monofilSFGnFGClosingStock.findUnique({
            where: { time_id: timeRecord.id },
        });

        const closingValue = sfgClosing ? sfgClosing.sfg_yarn_value + sfgClosing.fg_fabric_value : 0;

        const tradingSFGfg = await prisma.tradingCogs.findUnique({
            where: { time_id: timeRecord.id },
        });

        const rm = await prisma.rmConsumptionCogs.findUnique({
            where: { time_id: timeRecord.id },
        });

        const pal2 = await prisma.pal2.findUnique({
            where: { time_id: timeRecord.id },
        });

        const sales = {
            monofil: (pal2 ? pal2.Monofil_Sales_Value : 0) + (pal2 ? pal2.Monofil_Trading_Value : 0),
            trading: pal2 ? pal2.Trading_SaleS_Value : 0,
            rm: pal2 ? pal2.HD_Sale_Value : 0,
            otherInc: (pal2?.GST_Refund_Value || 0) + (pal2?.Othr_Inc_Value || 0) + (pal2?.waste_Value || 0),
        };

        const consumption = {
            monofil,
            mfPurchase: (mfPurchase?.yarnValue || 0) + (mfPurchase?.purchaseFabricValue || 0) + (mfPurchase?.consumablesPurchase || 0),
            sfgFG: openingValue - closingValue,
            tradingSFGfg: tradingSFGfg?.difference_stock_value || 0,
            rm: rm?.salesValue || 0,
        };

        consumption.totalMonofil = consumption.monofil + consumption.mfPurchase + consumption.sfgFG;
        consumption.totalConsumption = consumption.totalMonofil + consumption.tradingSFGfg + consumption.rm;

        console.log('📊 Consumption:', consumption);

        let s21 = await prisma.variableAndDirect.findUnique({
            where: { time_id: timeRecord.id },
        });

        s21 = s21 ? Object.keys(s21).reduce((sum, key) => {
            if (key !== 'id' && key !== 'time_id') {
                return sum + (s21[key] || 0);
            }
            return sum;
        }, 0) : 0;

        let s47 = await prisma.variableAndDirect.findUnique({
            where: { time_id: oneMonthBackRecord.id },
        });

        s47 = s47 ? s47.wagesFabric + s47.wagesInspectionDispatch + s47.fabricationCharges : 0;

        const operatingExpenses = {
            totalVariableAndDirect: s21 - s47,
            frabic: s47,
        };

        const deprecation = await prisma.fixedExpenses.findUnique({
            where: { time_id: timeRecord.id },
        });

        const overheads = deprecation
            ? Object.keys(deprecation).reduce((sum, key) => {
                if (key !== 'id' && key !== 'time_id' && key !== 'depreciation') {
                    return sum + (deprecation[key] || 0);
                }
                return sum;
            }, 0)
            : 0;

        const fixedExpenses = {
            deprecation,
            overheads,
        };

        // Database upsert operations remain unchanged
        await prisma.sales.upsert({
            where: { time_id: timeRecord.id },
            update: {
                monofil: sales.monofil,
                trading: sales.trading,
                rm: sales.rm,
                otherInc: sales.otherInc,
            },
            create: {
                time_id: timeRecord.id,
                monofil: sales.monofil,
                trading: sales.trading,
                rm: sales.rm,
                otherInc: sales.otherInc,
            },
        });

        await prisma.consumption.upsert({
            where: { time_id: timeRecord.id },
            update: {
                monofil: consumption.monofil,
                mfPurchase: consumption.mfPurchase,
                sfgFG: consumption.sfgFG,
                tradingSFGfg: consumption.tradingSFGfg,
                rm: consumption.rm,
                totalMonofil: consumption.totalMonofil,
                totalConsumption: consumption.totalConsumption,
            },
            create: {
                time_id: timeRecord.id,
                monofil: consumption.monofil,
                mfPurchase: consumption.mfPurchase,
                sfgFG: consumption.sfgFG,
                tradingSFGfg: consumption.tradingSFGfg,
                rm: consumption.rm,
                totalMonofil: consumption.totalMonofil,
                totalConsumption: consumption.totalConsumption,
            },
        });

        await prisma.operatingExpenses.upsert({
            where: { time_id: timeRecord.id },
            update: {
                totalVariableAndDirect: operatingExpenses.totalVariableAndDirect,
                frabic: operatingExpenses.frabic,
            },
            create: {
                time_id: timeRecord.id,
                totalVariableAndDirect: operatingExpenses.totalVariableAndDirect,
                frabic: operatingExpenses.frabic,
            },
        });

        await prisma.fixedExpenses.upsert({
            where: { time_id: timeRecord.id },
            update: {
                depreciation: fixedExpenses.deprecation?.depreciation || 0,
                overheads: fixedExpenses.overheads,
            },
            create: {
                time_id: timeRecord.id,
                depreciation: fixedExpenses.deprecation?.depreciation || 0,
                overheads: fixedExpenses.overheads,
            },
        });

        // Modified Excel generation code
        const currentMonth = req.query.month;
        const calculatePercentage = (value, total) => total !== 0 && value !== "" ? Math.round((value / total) * 100) + "%" : "";

        const depreciationValue = fixedExpenses.deprecation?.depreciation || 0;
        const overheadsValue = fixedExpenses.overheads || 0;

        // Break down operating expenses into Yarn, Fabric, and Trading
        const s21Data = await prisma.variableAndDirect.findUnique({
            where: { time_id: timeRecord.id },
        });

        const operatingExpensesBreakdown = s21Data ? {
            yarn: (s21Data.wagesYarn || 0) + (s21Data.powerYarn || 0) + (s21Data.consumablesYarn || 0),
            fabric: (s21Data.wagesFabric || 0) + (s21Data.wagesInspectionDispatch || 0) + (s21Data.powerFabric || 0) + (s21Data.consumablesFabric || 0) + (s21Data.fabricationCharges || 0),
            trading: (s21Data.commission || 0) + (s21Data.conveyanceCharges || 0),
        } : { yarn: 0, fabric: 0, trading: 0 };

        const operatingExpensesDetail = {
            yarn: operatingExpensesBreakdown.yarn,
            fabric: operatingExpensesBreakdown.fabric - s47, // Adjust fabric expenses
            trading: operatingExpensesBreakdown.trading,
            totalVariableAndDirect: operatingExpensesBreakdown.yarn + (operatingExpensesBreakdown.fabric - s47) + operatingExpensesBreakdown.trading,
        };

        // Calculate Total Sales
        const totalSales = sales.monofil + sales.trading + sales.rm;

        // Calculate Operating Profit (OP Profit)
        const opProfit = totalSales + sales.otherInc - consumption.totalConsumption - operatingExpensesDetail.totalVariableAndDirect;

        // Calculate Net Profit (NET)
        const netProfit = opProfit - depreciationValue - overheadsValue;

        const headers = [
            ["Month", "Monofil", "Trading", "RM Sales", "Total", "Othr Inc", "Monofil", "%age", "MF Purchase", "SFG/FG", "Total Monofil", "%age", "Trading", "SFG/FG", "RM", "Total Consm", "%age", "Yarn", "%age", "Fabric", "%age", "Trading", "Operating Expenses", "%age", "OP Profit", "Depreciation", "%age", "Overheads", "%age", "NET"]
        ];

        const dataRow = [
            currentMonth, // Month
            sales.monofil, // Monofil (Sales)
            sales.trading, // Trading (Sales)
            sales.rm, // RM Sales
            totalSales, // Total (Sales)
            sales.otherInc, // Othr Inc
            consumption.monofil, // Monofil (Consumption)
            calculatePercentage(consumption.monofil, consumption.totalConsumption), // %age
            consumption.mfPurchase, // MF Purchase
            consumption.sfgFG, // SFG/FG (Monofil)
            consumption.totalMonofil, // Total Monofil (Consumption)
            calculatePercentage(consumption.totalMonofil, consumption.totalConsumption), // %age
            0, // Trading (Consumption) - Placeholder, as it's missing
            consumption.tradingSFGfg, // SFG/FG (Trading)
            consumption.rm, // RM (Consumption)
            consumption.totalConsumption, // Total Consm
            "100%", // %age (Total Consm, always 100%)
            operatingExpensesDetail.yarn, // Yarn
            calculatePercentage(operatingExpensesDetail.yarn, consumption.totalConsumption), // %age
            operatingExpensesDetail.fabric, // Fabric
            calculatePercentage(operatingExpensesDetail.fabric, consumption.totalConsumption), // %age
            operatingExpensesDetail.trading, // Trading (Operating Expenses)
            operatingExpensesDetail.totalVariableAndDirect, // Operating Expenses (Total)
            calculatePercentage(operatingExpensesDetail.totalVariableAndDirect, consumption.totalConsumption), // %age
            opProfit, // OP Profit
            depreciationValue, // Depreciation
            calculatePercentage(depreciationValue, consumption.totalConsumption), // %age
            overheadsValue, // Overheads
            calculatePercentage(overheadsValue, consumption.totalConsumption), // %age
            netProfit // NET
        ];

        // Determine the starting row for the new data
        let startRow = 1; // Default to row 2 (0-based index, after header)
        if (fileExists) {
            const range = xlsx.utils.decode_range(ws['!ref'] || 'A1:A1');
            startRow = range.e.r + 1; // Next row after the last used row
        }

        // If file doesn't exist, add headers
        if (!fileExists) {
            xlsx.utils.sheet_add_aoa(ws, headers, { origin: "A1" });
        }

        // Add new data row
        xlsx.utils.sheet_add_aoa(ws, [dataRow], { origin: { r: startRow, c: 0 } });

        // Set column widths
        ws['!cols'] = [
            { wch: 10 }, // Month
            { wch: 12 }, // Monofil (Sales)
            { wch: 12 }, // Trading (Sales)
            { wch: 12 }, // RM Sales
            { wch: 12 }, // Total (Sales)
            { wch: 12 }, // Othr Inc
            { wch: 12 }, // Monofil (Consumption)
            { wch: 8 },  // %age
            { wch: 12 }, // MF Purchase
            { wch: 12 }, // SFG/FG (Monofil)
            { wch: 12 }, // Total Monofil (Consumption)
            { wch: 8 },  // %age
            { wch: 12 }, // Trading (Consumption)
            { wch: 12 }, // SFG/FG (Trading)
            { wch: 12 }, // RM (Consumption)
            { wch: 12 }, // Total Consm
            { wch: 8 },  // %age
            { wch: 12 }, // Yarn
            { wch: 8 },  // %age
            { wch: 12 }, // Fabric
            { wch: 8 },  // %age
            { wch: 12 }, // Trading (Operating Expenses)
            { wch: 12 }, // Operating Expenses (Total)
            { wch: 8 },  // %age
            { wch: 12 }, // OP Profit
            { wch: 12 }, // Depreciation
            { wch: 8 },  // %age
            { wch: 12 }, // Overheads
            { wch: 8 },  // %age
            { wch: 12 }  // NET
        ];

        // Add or update worksheet in workbook
        if (!fileExists) {
            xlsx.utils.book_append_sheet(wb, ws, "FinAnalysis");
        }

        // Write the file
        xlsx.writeFile(wb, filePath);
        console.log(`📊 Excel file updated: ${filePath}`);

        // Send response
        res.status(200).json({ message: 'Financial Analysis data extracted, added, and Excel file generated successfully', file: filePath });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});



// app.get("/salesSummary", async (req, res) => {
//     try {
//         const month = req.query.month;

//         const date = parseExcelDate(month);

//         const timeRecord = await prisma.timeRecord.findUnique({
//             where: {
//                 time: date,
//             },
//         });

//         if (!timeRecord) {
//             return res.status(404).json({ message: 'Time record not found for the given date' });
//         }

//         const oneMonthBackRecord = await prisma.timeRecord.findFirst({
//             where: {
//                 time: new Date(date.setMonth(date.getMonth() - 1)),
//             },
//         });

//         if (!oneMonthBackRecord) {
//             return res.status(404).json({ message: 'Time record not found for the previous month' });
//         }

//         const mcf = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "MCF",
//             },
//         });

//         const mcfSalesSummaray = {
//             time_id: timeRecord.id,
//             salesKgs: mcf ? mcf.outwardQty : 0,
//             salesValue: mcf ? mcf.amount : 0,
//         }

//         const wm = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "WMF",
//             },
//         });

//         const wmSalesSummary = {
//             time_id: timeRecord.id,
//             salesKgs: wm ? wm.outwardQty : 0,
//             salesValue: wm ? wm.amount : 0,
//         }

//         const inh = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "MONOFILAMENT FABRIC HAPPA",
//             },
//         });

//         const InhSalesSummray = {
//             time_id: timeRecord.id,
//             salesKgs: inh ? inh.outwardQty : 0,
//             salesValue: inh ? inh.amount : 0,
//         }

//         const yarn = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "NWF/Yarn",
//             },
//         });

//         const yarnSalesSummary = {
//             time_id: timeRecord.id,
//             salesKgs: yarn ? yarn.outwardQty : 0,
//             salesValue: yarn ? yarn.amount : 0,
//         }

//         const tsn = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "TSN",
//             },
//         });

//         const tsnSalesSummary = {
//             time_id: timeRecord.id,
//             salesKgs: tsn ? tsn.outwardQty : 0,
//             salesValue: tsn ? tsn.amount : 0,
//         }

//         const msn = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "MSN",
//             },
//         });

//         const msnSalesSummary = {
//             time_id: timeRecord.id,
//             salesKgs: msn ? msn.outwardQty : 0,
//             salesValue: msn ? msn.amount : 0,
//         }

//         const miscMaterials = [
//             "ANTI BIRD NET / Rope/MULCH/FIBC",
//             "Knitted Fabric 8\" Red/60\" D Green",
//             "Weed Mat 1.25 Mtrs Black",
//         ];

//         let miscSalesSummary = {
//             time_id: timeRecord.id,
//             salesKgs: 0,
//             salesValue: 0,
//         };

//         for (const material of miscMaterials) {
//             const misc = await prisma.inventoryDetails.findFirst({
//                 where: {
//                     time_id: timeRecord.id,
//                     materialName: material,
//                 },
//             });

//             miscSalesSummary.salesKgs += misc ? misc.outwardQty : 0;
//             miscSalesSummary.salesValue += misc ? misc.amount : 0;
//         }

//         const pps = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "PP Woven Sacks",
//             },
//         });

//         const ppsSalesSummary = {
//             time_id: timeRecord.id,
//             salesKgs: pps ? pps.outwardQty : 0,
//             salesValue: pps ? pps.amount : 0,
//         }

//         const rm = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "Raw Material",
//             },
//         });

//         const rmSalesSummary = {
//             time_id: timeRecord.id,
//             salesKgs: rm ? rm.outwardQty : 0,
//             salesValue: rm ? rm.amount : 0,
//         };

//         const waste = await prisma.inventoryDetails.findFirst({
//             where: {
//                 time_id: timeRecord.id,
//                 materialName: "HDPE Monofilament Waste",
//             },
//         });

//         const wasteSalesSummary = {
//             time_id: timeRecord.id,
//             salesKgs: waste ? waste.outwardQty : 0,
//             salesValue: waste ? waste.amount : 0,
//         };

//         console.log('📊 MCF Sales Summary:', mcfSalesSummaray);
//         console.log('📊 WM Sales Summary:', wmSalesSummary);
//         console.log('📊 INH Sales Summary:', InhSalesSummray);
//         console.log('📊 Yarn Sales Summary:', yarnSalesSummary);
//         console.log('📊 TSN Sales Summary:', tsnSalesSummary);
//         console.log('📊 MSN Sales Summary:', msnSalesSummary);
//         console.log('📊 Misc Sales Summary:', miscSalesSummary);
//         console.log('📊 PPS Sales Summary:', ppsSalesSummary);
//         console.log('📊 RM Sales Summary:', rmSalesSummary);
//         console.log('📊 Waste Sales Summary:', wasteSalesSummary);

//         const wb = xlsx.utils.book_new();
//         const ws = xlsx.utils.json_to_sheet([], { skipHeader: true }); // Start with an empty sheet

//         // Define the header row using req.query.month
//         const monthHeader = req.query.month; // Use the month from query param
//         const headers = [
//             ["MONTH", "MCF", "", "", "WM", "", "", "INH", "", "", "YARN", "", "", "TOTAL", "", "", "TSN", "", "", "MSN", "", "", "MISC", "", "", "PPS", "", "", "TOTAL", "", "", "RM", "", "", "WASTE", "", "", "MISC", "", "", "LABOUR", "", "", "TOTAL", "", ""],
//             ["", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate"]
//         ];

//         // Helper function to calculate rate (value/kgs) and handle division by zero
//         const calculateRate = (value, kgs) => kgs !== 0 && value !== "" ? (value / kgs).toFixed(2) : "";

//         // Calculate totals for the "TOTAL" columns
//         const total1Kgs = (mcfSalesSummaray.salesKgs || 0) + (wmSalesSummary.salesKgs || 0) + (InhSalesSummray.salesKgs || 0) + (yarnSalesSummary.salesKgs || 0);
//         const total1Value = (mcfSalesSummaray.salesValue || 0) + (wmSalesSummary.salesValue || 0) + (InhSalesSummray.salesValue || 0) + (yarnSalesSummary.salesValue || 0);
//         const total1Rate = calculateRate(total1Value, total1Kgs); // Rate for first TOTAL (MCF + WM + INH + YARN)

//         const total2Kgs = (tsnSalesSummary.salesKgs || 0) + (msnSalesSummary.salesKgs || 0) + (miscSalesSummary.salesKgs || 0) + (ppsSalesSummary.salesKgs || 0);
//         const total2Value = (tsnSalesSummary.salesValue || 0) + (msnSalesSummary.salesValue || 0) + (miscSalesSummary.salesValue || 0) + (ppsSalesSummary.salesValue || 0);
//         const total2Rate = calculateRate(total2Value, total2Kgs); // Rate for second TOTAL (TSN + MSN + MISC + PPS)

//         const total3Kgs = (rmSalesSummary.salesKgs || 0) + (wasteSalesSummary.salesKgs || 0); // MISC and LABOUR are missing
//         const total3Value = (rmSalesSummary.salesValue || 0) + (wasteSalesSummary.salesValue || 0); // MISC and LABOUR are missing
//         const total3Rate = calculateRate(total3Value, total3Kgs); // Rate for third TOTAL (RM + WASTE + MISC + LABOUR)

//         // Sales Summary Data for Excel (for the requested month)
//         const salesSummaryExcelData = [
//             [
//                 monthHeader, // MONTH
//                 mcfSalesSummaray.salesKgs, mcfSalesSummaray.salesValue, calculateRate(mcfSalesSummaray.salesValue, mcfSalesSummaray.salesKgs), // MCF (Rate = Value / Kgs)
//                 wmSalesSummary.salesKgs, wmSalesSummary.salesValue, calculateRate(wmSalesSummary.salesValue, wmSalesSummary.salesKgs), // WM (Rate = Value / Kgs)
//                 InhSalesSummray.salesKgs, InhSalesSummray.salesValue, calculateRate(InhSalesSummray.salesValue, InhSalesSummray.salesKgs), // INH (Rate = Value / Kgs)
//                 yarnSalesSummary.salesKgs, yarnSalesSummary.salesValue, calculateRate(yarnSalesSummary.salesValue, yarnSalesSummary.salesKgs), // YARN (Rate = Value / Kgs)
//                 total1Kgs, total1Value, total1Rate, // TOTAL (MCF + WM + INH + YARN, Rate = total1Value / total1Kgs)
//                 tsnSalesSummary.salesKgs, tsnSalesSummary.salesValue, calculateRate(tsnSalesSummary.salesValue, tsnSalesSummary.salesKgs), // TSN (Rate = Value / Kgs)
//                 msnSalesSummary.salesKgs, msnSalesSummary.salesValue, calculateRate(msnSalesSummary.salesValue, msnSalesSummary.salesKgs), // MSN (Rate = Value / Kgs)
//                 miscSalesSummary.salesKgs, miscSalesSummary.salesValue, calculateRate(miscSalesSummary.salesValue, miscSalesSummary.salesKgs), // MISC (Rate = Value / Kgs)
//                 ppsSalesSummary.salesKgs, ppsSalesSummary.salesValue, calculateRate(ppsSalesSummary.salesValue, ppsSalesSummary.salesKgs), // PPS (Rate = Value / Kgs)
//                 total2Kgs, total2Value, total2Rate, // TOTAL (TSN + MSN + MISC + PPS, Rate = total2Value / total2Kgs)
//                 rmSalesSummary.salesKgs, rmSalesSummary.salesValue, calculateRate(rmSalesSummary.salesValue, rmSalesSummary.salesKgs), // RM (Rate = Value / Kgs)
//                 wasteSalesSummary.salesKgs, wasteSalesSummary.salesValue, calculateRate(wasteSalesSummary.salesValue, wasteSalesSummary.salesKgs), // WASTE (Rate = Value / Kgs)
//                 "", "", "", // MISC (highlighted in red, missing)
//                 "", "", "", // LABOUR (missing)
//                 total3Kgs, total3Value, total3Rate // TOTAL (RM + WASTE + MISC + LABOUR, Rate = total3Value / total3Kgs)
//             ]
//         ];

//         // Combine headers and data
//         const allData = [
//             ...headers,
//             ...salesSummaryExcelData
//         ];

//         // Append all data to the worksheet
//         xlsx.utils.sheet_add_aoa(ws, allData, { origin: "A1" });

//         // Set column widths (optional)
//         ws['!cols'] = [
//             { wch: 10 }, // MONTH
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // MCF (Kgs, Value, Rate)
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // WM
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // INH
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // YARN
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // TOTAL
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // TSN
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // MSN
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // MISC
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // PPS
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // TOTAL
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // RM
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // WASTE
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // MISC
//             { wch: 10 }, { wch: 15 }, { wch: 10 }, // LABOUR
//             { wch: 10 }, { wch: 15 }, { wch: 10 }  // TOTAL
//         ];

//         // Add the worksheet to the workbook
//         xlsx.utils.book_append_sheet(wb, ws, "SalesSummary");

//         // Write the file
//         const filePath = `./SalesSummary_${monthHeader}.xlsx`;
//         xlsx.writeFile(wb, filePath);

//         console.log(`📊 Excel file generated: ${filePath}`);

//         // Send response
//         res.status(200).json({ message: 'Sales summary data processed and Excel file generated successfully', file: filePath });
//     } catch (error) {
//         console.error('❌ Error:', error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


app.get('/salesSummary', async (req, res) => {
    try {
        const month = req.query.month;
        const date = parseExcelDate(month);
        const filePath = path.join(__dirname, 'SalesSummary.xlsx'); // Write to data folder
        let wb, ws;

        // Check if the file exists
        const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);

        if (fileExists) {
            // Read existing workbook
            wb = xlsx.readFile(filePath);
            ws = wb.Sheets[wb.SheetNames[0]]; // Assume data is in the first sheet
        } else {
            // Create new workbook and worksheet
            wb = xlsx.utils.book_new();
            ws = xlsx.utils.json_to_sheet([], { skipHeader: true });
        }

        const timeRecord = await prisma.timeRecord.findUnique({
            where: {
                time: date,
            },
        });

        if (!timeRecord) {
            return res.status(404).json({ message: 'Time record not found for the given date' });
        }

        const oneMonthBackRecord = await prisma.timeRecord.findFirst({
            where: {
                time: new Date(date.setMonth(date.getMonth() - 1)),
            },
        });

        if (!oneMonthBackRecord) {
            return res.status(404).json({ message: 'Time record not found for the previous month' });
        }

        const mcf = await prisma.inventoryDetails.findFirst({
            where: {
                time_id: timeRecord.id,
                materialName: "MCF",
            },
        });

        const mcfSalesSummaray = {
            time_id: timeRecord.id,
            salesKgs: mcf ? mcf.outwardQty : 0,
            salesValue: mcf ? mcf.amount : 0,
        };

        const wm = await prisma.inventoryDetails.findFirst({
            where: {
                time_id: timeRecord.id,
                materialName: "WMF",
            },
        });

        const wmSalesSummary = {
            time_id: timeRecord.id,
            salesKgs: wm ? wm.outwardQty : 0,
            salesValue: wm ? wm.amount : 0,
        };

        const inh = await prisma.inventoryDetails.findFirst({
            where: {
                time_id: timeRecord.id,
                materialName: "MONOFILAMENT FABRIC HAPPA",
            },
        });

        const InhSalesSummray = {
            time_id: timeRecord.id,
            salesKgs: inh ? inh.outwardQty : 0,
            salesValue: inh ? inh.amount : 0,
        };

        const yarn = await prisma.inventoryDetails.findFirst({
            where: {
                time_id: timeRecord.id,
                materialName: "NWF/Yarn",
            },
        });

        const yarnSalesSummary = {
            time_id: timeRecord.id,
            salesKgs: yarn ? yarn.outwardQty : 0,
            salesValue: yarn ? yarn.amount : 0,
        };

        const tsn = await prisma.inventoryDetails.findFirst({
            where: {
                time_id: timeRecord.id,
                materialName: "TSN",
            },
        });

        const tsnSalesSummary = {
            time_id: timeRecord.id,
            salesKgs: tsn ? tsn.outwardQty : 0,
            salesValue: tsn ? tsn.amount : 0,
        };

        const msn = await prisma.inventoryDetails.findFirst({
            where: {
                time_id: timeRecord.id,
                materialName: "MSN",
            },
        });

        const msnSalesSummary = {
            time_id: timeRecord.id,
            salesKgs: msn ? msn.outwardQty : 0,
            salesValue: msn ? msn.amount : 0,
        };

        const miscMaterials = [
            "ANTI BIRD NET / Rope/MULCH/FIBC",
            "Knitted Fabric 8\" Red/60\" D Green",
            "Weed Mat 1.25 Mtrs Black",
        ];

        let miscSalesSummary = {
            time_id: timeRecord.id,
            salesKgs: 0,
            salesValue: 0,
        };

        for (const material of miscMaterials) {
            const misc = await prisma.inventoryDetails.findFirst({
                where: {
                    time_id: timeRecord.id,
                    materialName: material,
                },
            });

            miscSalesSummary.salesKgs += misc ? misc.outwardQty : 0;
            miscSalesSummary.salesValue += misc ? misc.amount : 0;
        }

        const pps = await prisma.inventoryDetails.findFirst({
            where: {
                time_id: timeRecord.id,
                materialName: "PP Woven Sacks",
            },
        });

        const ppsSalesSummary = {
            time_id: timeRecord.id,
            salesKgs: pps ? pps.outwardQty : 0,
            salesValue: pps ? pps.amount : 0,
        };

        const rm = await prisma.inventoryDetails.findFirst({
            where: {
                time_id: timeRecord.id,
                materialName: "Raw Material",
            },
        });

        const rmSalesSummary = {
            time_id: timeRecord.id,
            salesKgs: rm ? rm.outwardQty : 0,
            salesValue: rm ? rm.amount : 0,
        };

        const waste = await prisma.inventoryDetails.findFirst({
            where: {
                time_id: timeRecord.id,
                materialName: "HDPE Monofilament Waste",
            },
        });

        const wasteSalesSummary = {
            time_id: timeRecord.id,
            salesKgs: waste ? waste.outwardQty : 0,
            salesValue: waste ? waste.amount : 0,
        };

        console.log('📊 MCF Sales Summary:', mcfSalesSummaray);
        console.log('📊 WM Sales Summary:', wmSalesSummary);
        console.log('📊 INH Sales Summary:', InhSalesSummray);
        console.log('📊 Yarn Sales Summary:', yarnSalesSummary);
        console.log('📊 TSN Sales Summary:', tsnSalesSummary);
        console.log('📊 MSN Sales Summary:', msnSalesSummary);
        console.log('📊 Misc Sales Summary:', miscSalesSummary);
        console.log('📊 PPS Sales Summary:', ppsSalesSummary);
        console.log('📊 RM Sales Summary:', rmSalesSummary);
        console.log('📊 Waste Sales Summary:', wasteSalesSummary);

        // Define the header rows
        const headers = [
            ["MONTH", "MCF", "", "", "WM", "", "", "INH", "", "", "YARN", "", "", "TOTAL", "", "", "TSN", "", "", "MSN", "", "", "MISC", "", "", "PPS", "", "", "TOTAL", "", "", "RM", "", "", "WASTE", "", "", "MISC", "", "", "LABOUR", "", "", "TOTAL", "", ""],
            ["", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate", "Kgs", "Value", "Rate"]
        ];

        // Helper function to calculate rate (value/kgs) and handle division by zero
        const calculateRate = (value, kgs) => kgs !== 0 && value !== "" ? (value / kgs).toFixed(2) : "";

        // Calculate totals for the "TOTAL" columns
        const total1Kgs = (mcfSalesSummaray.salesKgs || 0) + (wmSalesSummary.salesKgs || 0) + (InhSalesSummray.salesKgs || 0) + (yarnSalesSummary.salesKgs || 0);
        const total1Value = (mcfSalesSummaray.salesValue || 0) + (wmSalesSummary.salesValue || 0) + (InhSalesSummray.salesValue || 0) + (yarnSalesSummary.salesValue || 0);
        const total1Rate = calculateRate(total1Value, total1Kgs); // Rate for first TOTAL (MCF + WM + INH + YARN)

        const total2Kgs = (tsnSalesSummary.salesKgs || 0) + (msnSalesSummary.salesKgs || 0) + (miscSalesSummary.salesKgs || 0) + (ppsSalesSummary.salesKgs || 0);
        const total2Value = (tsnSalesSummary.salesValue || 0) + (msnSalesSummary.salesValue || 0) + (miscSalesSummary.salesValue || 0) + (ppsSalesSummary.salesValue || 0);
        const total2Rate = calculateRate(total2Value, total2Kgs); // Rate for second TOTAL (TSN + MSN + MISC + PPS)

        const total3Kgs = (rmSalesSummary.salesKgs || 0) + (wasteSalesSummary.salesKgs || 0); // MISC and LABOUR are missing
        const total3Value = (rmSalesSummary.salesValue || 0) + (wasteSalesSummary.salesValue || 0); // MISC and LABOUR are missing
        const total3Rate = calculateRate(total3Value, total3Kgs); // Rate for third TOTAL (RM + WASTE + MISC + LABOUR)

        // Sales Summary Data for Excel (for the requested month)
        const salesSummaryExcelData = [
            [
                month, // MONTH
                mcfSalesSummaray.salesKgs, mcfSalesSummaray.salesValue, calculateRate(mcfSalesSummaray.salesValue, mcfSalesSummaray.salesKgs), // MCF
                wmSalesSummary.salesKgs, wmSalesSummary.salesValue, calculateRate(wmSalesSummary.salesValue, wmSalesSummary.salesKgs), // WM
                InhSalesSummray.salesKgs, InhSalesSummray.salesValue, calculateRate(InhSalesSummray.salesValue, InhSalesSummray.salesKgs), // INH
                yarnSalesSummary.salesKgs, yarnSalesSummary.salesValue, calculateRate(yarnSalesSummary.salesValue, yarnSalesSummary.salesKgs), // YARN
                total1Kgs, total1Value, total1Rate, // TOTAL (MCF + WM + INH + YARN)
                tsnSalesSummary.salesKgs, tsnSalesSummary.salesValue, calculateRate(tsnSalesSummary.salesValue, tsnSalesSummary.salesKgs), // TSN
                msnSalesSummary.salesKgs, msnSalesSummary.salesValue, calculateRate(msnSalesSummary.salesValue, msnSalesSummary.salesKgs), // MSN
                miscSalesSummary.salesKgs, miscSalesSummary.salesValue, calculateRate(miscSalesSummary.salesValue, miscSalesSummary.salesKgs), // MISC
                ppsSalesSummary.salesKgs, ppsSalesSummary.salesValue, calculateRate(ppsSalesSummary.salesValue, ppsSalesSummary.salesKgs), // PPS
                total2Kgs, total2Value, total2Rate, // TOTAL (TSN + MSN + MISC + PPS)
                rmSalesSummary.salesKgs, rmSalesSummary.salesValue, calculateRate(rmSalesSummary.salesValue, rmSalesSummary.salesKgs), // RM
                wasteSalesSummary.salesKgs, wasteSalesSummary.salesValue, calculateRate(wasteSalesSummary.salesValue, wasteSalesSummary.salesKgs), // WASTE
                "", "", "", // MISC (missing)
                "", "", "", // LABOUR (missing)
                total3Kgs, total3Value, total3Rate // TOTAL (RM + WASTE + MISC + LABOUR)
            ]
        ];

        // Determine the starting row for the new data
        let startRow = 2; // Default to row 3 (0-based index, after two header rows)
        if (fileExists) {
            const range = xlsx.utils.decode_range(ws['!ref'] || 'A1:A1');
            startRow = range.e.r + 1; // Next row after the last used row
        }

        // If file doesn't exist, add headers
        if (!fileExists) {
            xlsx.utils.sheet_add_aoa(ws, headers, { origin: "A1" });
        }

        // Add new data row
        xlsx.utils.sheet_add_aoa(ws, salesSummaryExcelData, { origin: { r: startRow, c: 0 } });

        // Set column widths
        ws['!cols'] = [
            { wch: 10 }, // MONTH
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // MCF (Kgs, Value, Rate)
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // WM
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // INH
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // YARN
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // TOTAL
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // TSN
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // MSN
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // MISC
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // PPS
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // TOTAL
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // RM
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // WASTE
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // MISC
            { wch: 10 }, { wch: 15 }, { wch: 10 }, // LABOUR
            { wch: 10 }, { wch: 15 }, { wch: 10 }  // TOTAL
        ];

        // Add or update worksheet in workbook
        if (!fileExists) {
            xlsx.utils.book_append_sheet(wb, ws, "SalesSummary");
        }

        // Write the file
        xlsx.writeFile(wb, filePath);
        console.log(`📊 Excel file updated: ${filePath}`);

        // Send response
        res.status(200).json({ message: 'Sales summary data processed and Excel file generated successfully', file: filePath });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/consolidateReports', async (req, res) => {
    try {
        const outputFilePath = path.join(__dirname, 'ConsolidatedReports.xlsx');
        const wb = xlsx.utils.book_new();
        const files = [
            'COGS.xlsx',
            'PAL1.xlsx',
            'TradingPL.xlsx',
            'PAL2.xlsx',
            'FinAnalysis.xlsx',
            'SalesSummary.xlsx'
        ];
        for (const file of files) {
            const filePath = path.join(__dirname, file);
            try {
                const existingWb = xlsx.readFile(filePath);
                const ws = existingWb.Sheets[existingWb.SheetNames[0]];
                xlsx.utils.book_append_sheet(wb, ws, file.replace('.xlsx', ''));
            } catch (error) {
                console.warn(`⚠️ File not found or error reading ${file}: ${error.message}`);
                const ws = xlsx.utils.aoa_to_sheet([['No data available for ' + file]]);
                xlsx.utils.book_append_sheet(wb, ws, file.replace('.xlsx', ''));
            }
        }
        xlsx.writeFile(wb, outputFilePath);
        console.log(`📊 Consolidated Excel file generated: ${outputFilePath}`);
        res.status(200).json({ message: 'Consolidated reports generated successfully', file: outputFilePath });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/separateReports', (req, res) => {
    try {
        const inputFilePath = path.join(__dirname, 'ConsolidatedReports.xlsx');

        // Check if ConsolidatedReports.xlsx exists using callback-based fs.access
        fs.access(inputFilePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).json({ message: 'ConsolidatedReports.xlsx not found' });
            }

            // Read the consolidated workbook
            const wb = xlsx.readFile(inputFilePath);
            const sheetNames = wb.SheetNames;

            // Expected sheets
            const expectedSheets = [
                'COGS',
                'PAL1',
                'TradingPL',
                'PAL2',
                'FinAnalysis',
                'SalesSummary'
            ];

            // Array to track generated files
            const generatedFiles = [];

            // Iterate over each sheet
            for (const sheetName of sheetNames) {
                // Only process sheets that match expected names
                if (!expectedSheets.includes(sheetName)) {
                    console.warn(`⚠️ Skipping unexpected sheet: ${sheetName}`);
                    continue;
                }

                // Get the worksheet
                const ws = wb.Sheets[sheetName];

                // Create a new workbook for this sheet
                const newWb = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(newWb, ws, sheetName);

                // Define the output file path (e.g., COGS.xlsx)
                const outputFilePath = path.join(__dirname, `${sheetName}.xlsx`);

                // Write the individual file
                xlsx.writeFile(newWb, outputFilePath);
                generatedFiles.push(outputFilePath);
                console.log(`📊 Generated individual file: ${outputFilePath}`);
            }

            if (generatedFiles.length === 0) {
                return res.status(400).json({ message: 'No valid sheets found to separate' });
            }

            // Send response
            res.status(200).json({
                message: 'Consolidated reports separated successfully',
                files: generatedFiles
            });
        });
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

const server = app.listen(port, () => {
    console.log(`Server running on ${port}`);
});

// Graceful Shutdown to Release Port
process.on("SIGINT", () => {
    console.log("Shutting down server...");
    server.close(() => {
        console.log("Server closed. Exiting process.");
        process.exit(0);
    });
});