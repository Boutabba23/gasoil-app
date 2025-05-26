const MAX_LITRES = 50710; // Max capacity



const jaugeMatrixDataRows = [
  ["00", "0", "74", "148", "222", "296", "370", "444", "519", "593", "667"],
  ["01", "741", "847", "954", "1060", "1166", "1273", "1379", "1485", "1592", "1698"],
  ["02", "1832", "1983", "2135", "2286", "2438", "2589", "2741", "2899", "3058", "3217"],
  ["03", "3376", "3534", "3693", "3847", "3998", "4150", "4301", "4453", "4604", "4760"],
  ["04", "4956", "5153", "5349", "5545", "5741", "5933", "6125", "6318", "6510", "6702"],
  ["05", "6895", "7087", "7279", "7472", "7664", "7871", "8089", "8306", "8523", "8741"],
  ["06", "8933", "9125", "9318", "9510", "9702", "9915", "10132", "10349", "10567", "10786"],
  ["07", "11013", "11241", "11468", "11695", "11907", "12116", "12324", "12532", "12741", "12991"],
  ["8",  "13241", "13491", "13741", "13963", "14185", "14407", "14630", "14866", "15116", "15366"], // Assuming "8" means prefix "08" or just "8" to form 80, 81 etc.
  ["09", "15616", "15857", "16090", "16322", "16555", "16790", "17033", "17277", "17521", "17763"],
  ["10", "17985", "18207", "18430", "18652", "18891", "19141", "19391", "19641", "19887", "20131"],
  ["11", "20375", "20619", "20866", "21116", "21366", "21616", "21866", "22116", "22366", "22616"],
  ["12", "22863", "23107", "23350", "23594", "23841", "24091", "24341", "24591", "24841", "25091"],
  ["13", "25341", "25591", "25832", "26059", "26286", "26513", "26741", "26991", "27241", "27491"],
  ["14", "27741", "27966", "28195", "28423", "28650", "28907", "29185", "29463", "29741", "29985"],
  ["15", "30229", "30472", "30716", "30966", "31216", "31466", "31716", "31960", "32204", "32448"],
  ["16", "32692", "32941", "33191", "33441", "33691", "33919", "34141", "34363", "34585", "34814"],
  ["17", "35058", "35302", "35546", "35787", "36020", "36252", "36485", "36717", "36966", "37216"],
  ["18", "37466", "37716", "37941", "38163", "38385", "38607", "38841", "39091", "39341", "39591"],
  ["19", "39810", "39982", "40155", "40327", "40499", "40672", "40877", "41104", "41332", "41559"],
  ["20", "41776", "41955", "42134", "42312", "42491", "42669", "42856", "43048", "43241", "43433"],
  ["21", "43625", "43828", "44045", "44262", "44480", "44697", "44895", "45087", "45279", "45472"],
  ["22", "45664", "45856", "46048", "46241", "46433", "46625", "46819", "47015", "47211", "47407"],
  ["23", "47603", "47786", "47938", "48089", "48241", "48392", "48544", "48695", "48852", "49011"],
  ["24", "49169", "49328", "49487", "49646", "49801", "49953", "50104", "50256", "50407", "50559"],
  ["25", "50710", "Plein", "Plein", "Plein", "Plein", "Plein", "Plein", "Plein", "Plein", "Plein"],
];

const processedSeedData: { cm: number; litres: number }[] = [];

// Iterate through each row of the jaugeMatrixDataRows
jaugeMatrixDataRows.forEach(dataRow => {
  const prefix = dataRow[0]; // This is "00", "01", ..., "8", ..., "25"

  // Iterate for each unit digit (0 through 9)
  // The corresponding litre value is at dataRow[unitDigit + 1]
  for (let unitDigit = 0; unitDigit <= 9; unitDigit++) {
    const cmString = prefix + unitDigit.toString(); // e.g., "00" + "0" = "000"; "8" + "0" = "80"; "25" + "1" = "251"
    const cmValue = parseInt(cmString, 10);

    if (cmValue > 259) { // Ensure we don't go beyond 300 cm
        continue;
    }

    const litreString = dataRow[unitDigit + 1];
    
    if (litreString === undefined) {
      // This might happen if a row is shorter than expected; skip this entry.
      console.warn(`Missing litre data for cm: ${cmValue} (prefix: ${prefix}, unit: ${unitDigit})`);
      continue;
    }

    let litreValue: number;
    if (litreString.toLowerCase() === "plein") {
      litreValue = MAX_LITRES;
    } else {
      const parsedLitres = parseInt(litreString, 10);
      if (isNaN(parsedLitres)) {
        // This could happen if there's an unexpected string other than "Plein"
        console.warn(`Could not parse litres for cm=${cmValue}, raw value='${litreString}'. Assuming 0 or skipping.`);
        // Decide how to handle: skip, set to 0, or error out
        // For now, let's skip if it's truly unparsable and not "Plein"
        continue; 
      }
      litreValue = parsedLitres;
    }
    processedSeedData.push({ cm: cmValue, litres: litreValue });
  }
});

export default processedSeedData;