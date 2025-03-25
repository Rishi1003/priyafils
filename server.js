// basic boilerplate for a express server
import express from 'express';
import fs from 'fs';
import xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';


import { parseExcelDate } from './utils.js';






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

        await prisma.fixedExpenses.upsert({
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

app.get("/cogs", async (req, res) => {

    try {

        const month = req.query.month

        const date = parseExcelDate(month);

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
            }
        });

        if (!oneMonthBackRecord) {
            return res.status(404).json({ message: 'Time record not found for the previous month' });
        }



        const stockValuation = await prisma.stockValuation.findMany({
            where: {
                time_id: oneMonthBackRecord.id,
            }
        });


        const purchaseData = await prisma.hdpePurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });


        const inventoryDetails = await prisma.inventoryDetails.findMany({
            where: {
                time_id: timeRecord.id,
                materialName: "Raw Material"
            }
        });

        const salesDetails = await prisma.salesDetails.findUnique({
            where: {
                time_id: timeRecord.id,
            }
        });

        console.log('📊 Shadenet and PP Fabric:', salesDetails);


        const purchaseDiscount = await prisma.ConsumablesPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });



        const stockValuationNext = await prisma.stockValuation.findMany({
            where: {
                time_id: timeRecord.id,
                material_type: "hdpeGranules"
            }
        });

        const hdpeCogsData = {
            openingStock: stockValuation ? stockValuation[0].qty : 0,
            openingStockValue: stockValuation ? stockValuation[0].value : 0,

            purchaseQty: purchaseData ? purchaseData.kgs : 0,
            purchaseValue: purchaseDiscount && purchaseData ? purchaseData.value - purchaseDiscount.discount : 0,

            // consumables: dont know where to get data from 
            // purchaseReturn: dont know where to get data from 

            salesQty: inventoryDetails ? inventoryDetails[0].outwardQty : 0,
            salesValue: inventoryDetails && salesDetails ? salesDetails.RMPurchaseForSales : 0, // minus some value should be done where to get that value from

            closingStockQty: stockValuationNext ? stockValuationNext[0].qty : 0,
            closingStockValue: stockValuationNext ? stockValuationNext[0].value : 0,

        }

        console.log('📊 HDPE COGS Data:', hdpeCogsData);


        const mBStockData = await prisma.stockValuation.findMany({
            where: {
                time_id: oneMonthBackRecord.id,
                material_type: "masterBatches"
            }
        });

        const mBPurchaseData = await prisma.mBPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const mBClosingStockData = await prisma.stockValuation.findMany({
            where: {
                time_id: timeRecord.id,
                material_type: "masterBatches"
            }
        });


        const mdCogsData = {
            openingStock: mBStockData ? mBStockData[0].qty : 0,
            openingStockValue: mBStockData ? mBStockData[0].value : 0, //actual value is different from the db value even in the excel the ref is not there

            purchaseQty: mBPurchaseData ? mBPurchaseData.kgs : 0,
            purchaseValue: mBPurchaseData ? mBPurchaseData.value : 0,

            closingStockQty: mBClosingStockData ? mBClosingStockData[0].qty : 0,
            closingStockValue: mBClosingStockData ? mBClosingStockData[0].value : 0,
        }

        console.log('📊 MD COGS Data:', mdCogsData);

        const cpOpeningStockData = await prisma.stockValuation.findMany({
            where: {
                time_id: oneMonthBackRecord.id,
                material_type: "colourPigments"
            }
        });

        const cpPurchaseData = await prisma.cPPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const cpClosingStockData = await prisma.stockValuation.findMany({
            where: {
                time_id: timeRecord.id,
                material_type: "colourPigments"
            }
        });

        const cpCogsData = {

            openingStock: cpOpeningStockData ? cpOpeningStockData[0].qty : 0,
            openingStockValue: cpOpeningStockData ? cpOpeningStockData[0].value : 0,

            purchaseQty: cpPurchaseData ? cpPurchaseData.kgs : 0,
            purchaseValue: cpPurchaseData ? cpPurchaseData.value : 0,

            closingStockQty: cpClosingStockData ? cpClosingStockData[0].qty : 0,
            closingStockValue: cpClosingStockData ? cpClosingStockData[0].value : 0,

        }

        console.log('📊 CP COGS Data:', cpCogsData);

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

        console.log('📊 RM Consumption COGS Data:', rmConsumptionCogsData);

        const yarnPurchaseData = await prisma.yarnPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const sravyaOthersData = await prisma.sravyaOthersPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const consumablesData = await prisma.ConsumablesPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const monofilCogsData = {
            yarnPurchases: yarnPurchaseData ? yarnPurchaseData.kgs : 0,
            yarnValue: yarnPurchaseData ? yarnPurchaseData.value : 0,

            purchaseFabric: sravyaOthersData ? sravyaOthersData.kgs : 0,
            purchaseFabricValue: sravyaOthersData ? sravyaOthersData.value : 0,

            consumablesPurchase: consumablesData ? consumablesData.value : 0,
        }

        console.log('📊 Monofilament COGS Data:', monofilCogsData);

        const stockvaluationData = await prisma.stockValuation.findMany({
            where: {
                time_id: oneMonthBackRecord.id,
                material_type: "shadenet_fabrics_weed_mat"
            }
        });


        //more data needs to come from tradingPL
        const tradingConsumptionCogsData = {
            openingStock: stockvaluationData ? stockvaluationData[0].qty : 0,
        }

        console.log('📊 Trading Consumption COGS Data:', tradingConsumptionCogsData);


        const totalCogsDataCOGS = {
            openingStock: rmConsumptionCogsData.openingStock || 0,  // + monofilCogsData openingstock
            openingStockValue: rmConsumptionCogsData.openingStockValue || 0, // + monofilCogsData openingstockvalue  

            purchaseHD: hdpeCogsData.purchaseQty || 0,
            purchaseHDValue: hdpeCogsData.purchaseValue || 0,

            purchaseMD: mdCogsData.purchaseQty || 0,
            purchaseMDValue: mdCogsData.purchaseValue || 0,

            purchaseMonofil: monofilCogsData.yarnPurchases || 0,
            purchaseMonofilValue: monofilCogsData.yarnValue || 0,

            // purchaseTrading: tradingConsumptionCogsData.openingStock || 0, // need to get data from tradingPL
            rmSales: rmConsumptionCogsData.sales || 0,
            rmSalesValue: rmConsumptionCogsData.salesValue || 0,

            closingStock: rmConsumptionCogsData.closingStock || 0, // + monofilCogsData closingstock
            closingStockValue: rmConsumptionCogsData.closingStockValue || 0, // + tradingConsumption closingstockvalue  
        }

        console.log('📊 Total COGS Data:', totalCogsDataCOGS);

        const stockVal = await prisma.stockValuation.findMany({
            where: {
                time_id: oneMonthBackRecord.id,
                AND: {
                    material_type: {
                        in: ["hdpe_tape_factory", "hdpe_tape_job_work"]
                    }
                }
            }
        });

        const stockValFrabric = await prisma.stockValuation.findMany({
            where: {
                time_id: oneMonthBackRecord.id,
                material_type: "hdpe_fishnet_fabrics"
            }
        });

        const monofilSFGnFGOpeningStockCOGS = {
            sfg_yarn: (stockVal[0] ? stockVal[0].qty : 0) + (stockVal[1] ? stockVal[1].qty : 0),
            sfg_yarn_value: (stockVal[0] ? stockVal[0].value : 0) + (stockVal[1] ? stockVal[1].value : 0),

            fg_fabric: stockValFrabric ? stockValFrabric[0].qty : 0,
            fg_fabric_value: stockValFrabric ? stockValFrabric[0].value : 0,
        }

        console.log('📊 monofilSFG openingstock', monofilSFGnFGOpeningStockCOGS);

        const purchaseYarn = await prisma.yarnPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const monofilSFGnFGPurchaseCOGS = {

            sfg_yarn: purchaseYarn ? purchaseYarn.kgs : 0,
            sfg_yarn_value: purchaseYarn ? purchaseYarn.value : 0,

            fg_fabric: sravyaOthersData ? sravyaOthersData.kgs : 0,
            fg_fabric_value: sravyaOthersData ? sravyaOthersData.value : 0,

            consumables: consumablesData ? consumablesData.value : 0,
        }

        console.log('📊 monofilSFG purchase', monofilSFGnFGPurchaseCOGS);

        const stockValClosing = await prisma.stockValuation.findMany({
            where: {
                time_id: timeRecord.id,
                AND: {
                    material_type: {
                        in: ["hdpe_tape_factory", "hdpe_tape_job_work"]
                    }
                }
            }
        });

        const stockValFrabricClosing = await prisma.stockValuation.findMany({
            where: {
                time_id: timeRecord.id,
                material_type: "hdpe_fishnet_fabrics"
            }
        });

        const monogilSFGnFGClosingStockCOGS = {
            sfg_yarn: (stockValClosing[0] ? stockValClosing[0].qty : 0) + (stockValClosing[1] ? stockValClosing[1].qty : 0),
            sfg_yarn_value: (stockValClosing[0] ? stockValClosing[0].value : 0) + (stockValClosing[1] ? stockValClosing[1].value : 0),

            fg_fabric: stockValFrabricClosing ? stockValFrabricClosing[0].qty : 0,
            fg_fabric_value: stockValFrabricClosing ? stockValFrabricClosing[0].value : 0,
        }

        console.log('📊 monofilSFG closingstock', monogilSFGnFGClosingStockCOGS);

        const stockvalOpening = await prisma.stockValuation.findMany({
            where: {
                time_id: oneMonthBackRecord.id,
                material_type: "shadenet_fabrics_weed_mat"
            }
        });

        const stockValClosingStock = await prisma.stockValuation.findMany({
            where: {
                time_id: timeRecord.id,
                AND: {
                    material_type: {
                        in: ["shadenet_fabrics_weed_mat", "pp_fabric_sacks"]
                    }
                }
            }
        });

        const tradingCOGS = {
            openingStock: stockvalOpening ? stockvalOpening[0].qty : 0,
            openingStockValue: stockvalOpening ? stockvalOpening[0].value : 0,

            closingStock: (stockValClosingStock[0] ? stockValClosingStock[0].qty : 0) + (stockValClosingStock[1] ? stockValClosingStock[1].qty : 0),
            closingStockValue: (stockValClosingStock[0] ? stockValClosingStock[0].value : 0) + (stockValClosingStock[1] ? stockValClosingStock[1].value : 0),
        }

        tradingCOGS.difference_stock = Math.abs(tradingCOGS.openingStock - tradingCOGS.closingStock);
        tradingCOGS.difference_stock_value = Math.abs(tradingCOGS.openingStockValue - tradingCOGS.closingStockValue);

        console.log('📊 Trading COGS', tradingCOGS);

        await prisma.hdpeCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...hdpeCogsData },
            create: { time_id: timeRecord.id, ...hdpeCogsData },
        });
        console.log('📊 HDPE COGS Data upserted:', hdpeCogsData);

        await prisma.mdCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...mdCogsData },
            create: { time_id: timeRecord.id, ...mdCogsData },
        });
        console.log('📊 MD COGS Data upserted:', mdCogsData);

        await prisma.cpCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...cpCogsData },
            create: { time_id: timeRecord.id, ...cpCogsData },
        });
        console.log('📊 CP COGS Data upserted:', cpCogsData);

        await prisma.rmConsumptionCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...rmConsumptionCogsData },
            create: { time_id: timeRecord.id, ...rmConsumptionCogsData },
        });
        console.log('📊 RM Consumption COGS Data upserted:', rmConsumptionCogsData);

        await prisma.monofilCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...monofilCogsData },
            create: { time_id: timeRecord.id, ...monofilCogsData },
        });
        console.log('📊 Monofilament COGS Data upserted:', monofilCogsData);

        await prisma.totalCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...totalCogsDataCOGS },
            create: { time_id: timeRecord.id, ...totalCogsDataCOGS },
        });
        console.log('📊 Total COGS Data upserted:', totalCogsDataCOGS);

        await prisma.monofilSFGnFGOpeningStock.upsert({
            where: { time_id: timeRecord.id },
            update: { ...monofilSFGnFGOpeningStockCOGS },
            create: { time_id: timeRecord.id, ...monofilSFGnFGOpeningStockCOGS },
        });
        console.log('📊 Monofil SFG Opening Stock upserted:', monofilSFGnFGOpeningStockCOGS);

        await prisma.monofilSFGnFGPurchase.upsert({
            where: { time_id: timeRecord.id },
            update: { ...monofilSFGnFGPurchaseCOGS },
            create: { time_id: timeRecord.id, ...monofilSFGnFGPurchaseCOGS },
        });
        console.log('📊 Monofil SFG Purchase upserted:', monofilSFGnFGPurchaseCOGS);

        await prisma.monofilSFGnFGClosingStock.upsert({
            where: { time_id: timeRecord.id },
            update: { ...monogilSFGnFGClosingStockCOGS },
            create: { time_id: timeRecord.id, ...monogilSFGnFGClosingStockCOGS },
        });
        console.log('📊 Monofil SFG Closing Stock upserted:', monogilSFGnFGClosingStockCOGS);

        await prisma.tradingCogs.upsert({
            where: { time_id: timeRecord.id },
            update: { ...tradingCOGS },
            create: { time_id: timeRecord.id, ...tradingCOGS },
        });
        console.log('📊 Trading COGS upserted:', tradingCOGS);


        return res.json({ message: 'COGS data extracted and added successfully' });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }

});


app.get("/pal1", async (req, res) => {
    try {
        const month = req.query.month

        const date = parseExcelDate(month);

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
            }
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
            where: {
                time_id: timeRecord.id,
            },
        });

        const mbPurchase = await prisma.mBPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const hdpePurchase = await prisma.hdpePurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const discount = await prisma.ConsumablesPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const purchTrading = await prisma.TRDNGPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const yarnPurch = await prisma.yarnPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const sravyaPurch = await prisma.sravyaOthersPurchase.findUnique({
            where: {
                time_id: timeRecord.id,
            },
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
            where: {
                time_id: timeRecord.id,
            },
        });

        const waste = await prisma.inventoryDetails.findFirst({
            where: {
                time_id: timeRecord.id,
                materialName: "HDPE Monofilament Waste"
            }
        });

        const palFinal = await prisma.salesDetails.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        })

        const directExpenses = await prisma.extrasManaufacturingDirectExpenses.findUnique({
            where: {
                time_id: timeRecord.id,
            }
        });

        const indirectExpenses = await prisma.totals.findMany({
            where: {
                time_id: timeRecord.id,
                type: "Indirect COST"
            }
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

        }

        pal1Data.directCost = pal1Data.directExpenses + pal1Data.fabricationValue + pal1Data.inHouseFabricationValue
        pal1Data.totalCost = pal1Data.directCost + pal1Data.indirectExpenses + pal1Data.deprecation

        const d8 = pal1Data.openingStockValue + pal1Data.purchaseRmValue + pal1Data.purchaseTradingValue + pal1Data.purchaseConsumablesValue;
        const d10 = d8 - pal1Data.closingStockValue
        const d12 = pal1Data.salesValue - d10

        const d17 = d12 + pal1Data.wasteValue + pal1Data.otherInc

        pal1Data.ProfitA = Math.abs(d17 - (pal1Data.directCost + pal1Data.indirectExpenses + pal1Data.deprecation))

        console.log('📊 PAL1 Data:', pal1Data);

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
}
);

app.get("/finAnalysis", async (req, res) => {
    try {
        const month = req.query.month

        const date = parseExcelDate(month);

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
            }
        });

        if (!oneMonthBackRecord) {
            return res.status(404).json({ message: 'Time record not found for the previous month' });
        }

        const rmConsumptionCogs = await prisma.rmConsumptionCogs.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const monofil = ((rmConsumptionCogs?.openingStockValue || 0) + (rmConsumptionCogs?.purchaseValue || 0)) - ((rmConsumptionCogs?.salesValue || 0) + (rmConsumptionCogs?.closingStockValue || 0)); //some values are worng or missing refer to the excel g4

        const mfPurchase = await prisma.monofilCogs.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const sfgOpening = await prisma.monofilSFGnFGOpeningStock.findUnique({
            where: {
                time_id: timeRecord.id,
            },
        });

        const openingValue = sfgOpening ? sfgOpening.sfg_yarn_value + sfgOpening.fg_fabric_value : 0;

        const sfgClosing = await prisma.monofilSFGnFGClosingStock.findUnique({
            where: {
                time_id: timeRecord.id
            }
        });

        const closingValue = sfgClosing ? sfgClosing.sfg_yarn_value + sfgClosing.fg_fabric_value : 0;


        // const sales = wait for pal2

        const consumption = {
            monofil,
            mfPurchase: mfPurchase.yarnValue + mfPurchase.purchaseFabricValue + mfPurchase.consumablesPurchase,
            sfgFG: openingValue - closingValue,


        }

        consumption.totalMonofil = consumption.monofil + consumption.mfPurchase + consumption.sfgFG

        console.log('📊 Consumption:', consumption);

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