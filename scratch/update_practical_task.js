import fs from 'fs';

// Read existing InteractivePracticalTask.jsx
let content = fs.readFileSync('/Users/libertywalk/gat/src/pages/Subjects/components/InteractivePracticalTask.jsx', 'utf-8');

// 1. Let's update translation keys first.
// We can rename old ones first using temporary names to avoid conflict, or do simple text replacements.
// Let's do a sequence of precise replacements in the text.

// Let's replace the check list for matching task:
content = content.replace(
  "const isMatchingTask = ['karto-1', 'karto-2', 'karto-4', 'gis-2', 'gis-8', 'gis-9', 'gis-14', 'gis-15'].includes(topicId)",
  "const isMatchingTask = ['karto-1', 'karto-2', 'karto-4', 'gis-2', 'gis-6', 'gis-9', 'gis-10', 'gis-13', 'gis-15', 'gis-16', 'gis-18', 'gis-19'].includes(topicId)"
);

// Update termsSource assignments in handleDefinitionSelect:
content = content.replace("if (topicId === 'gis-2') termsSource = tStr.gis2_terms", "if (topicId === 'gis-2') termsSource = tStr.gis2_terms");
content = content.replace("if (topicId === 'gis-8') termsSource = tStr.gis8_terms", "if (topicId === 'gis-9') termsSource = tStr.gis9_terms");
content = content.replace("if (topicId === 'gis-9') termsSource = tStr.gis9_terms", "if (topicId === 'gis-10') termsSource = tStr.gis10_terms");
content = content.replace("if (topicId === 'gis-14') termsSource = tStr.gis14_terms", "if (topicId === 'gis-18') termsSource = tStr.gis18_terms");
content = content.replace("if (topicId === 'gis-15') termsSource = tStr.gis15_terms", "if (topicId === 'gis-6') termsSource = tStr.gis6_terms");

// Add the new ones:
content = content.replace(
  "    if (topicId === 'gis-15') termsSource = tStr.gis6_terms",
  "    if (topicId === 'gis-15') termsSource = tStr.gis6_terms\n    if (topicId === 'gis-13') termsSource = tStr.gis13_terms\n    if (topicId === 'gis-15') termsSource = tStr.gis15_terms\n    if (topicId === 'gis-16') termsSource = tStr.gis16_terms\n    if (topicId === 'gis-19') termsSource = tStr.gis19_terms"
);

// Update sourceTerms logic in useEffect:
content = content.replace("} else if (topicId === 'gis-2') {\n      sourceTerms = tStr.gis2_terms\n    } else if (topicId === 'gis-8') {\n      sourceTerms = tStr.gis8_terms\n    } else if (topicId === 'gis-9') {\n      sourceTerms = tStr.gis9_terms\n    } else if (topicId === 'gis-14') {\n      sourceTerms = tStr.gis14_terms\n    } else if (topicId === 'gis-15') {\n      sourceTerms = tStr.gis15_terms",
                          "} else if (topicId === 'gis-2') {\n      sourceTerms = tStr.gis2_terms\n    } else if (topicId === 'gis-6') {\n      sourceTerms = tStr.gis6_terms\n    } else if (topicId === 'gis-9') {\n      sourceTerms = tStr.gis9_terms\n    } else if (topicId === 'gis-10') {\n      sourceTerms = tStr.gis10_terms\n    } else if (topicId === 'gis-13') {\n      sourceTerms = tStr.gis13_terms\n    } else if (topicId === 'gis-15') {\n      sourceTerms = tStr.gis15_terms\n    } else if (topicId === 'gis-16') {\n      sourceTerms = tStr.gis16_terms\n    } else if (topicId === 'gis-18') {\n      sourceTerms = tStr.gis18_terms\n    } else if (topicId === 'gis-19') {\n      sourceTerms = tStr.gis19_terms");

// Let's replace the verification logic function names and keys:
// checkGis6 -> checkGis7
content = content.replace("const checkGis6 = (opt) => {", "const checkGis7 = (opt) => {");
content = content.replace("setGis6Selection(opt)", "setGis6Selection(opt)"); // state variable stays gis6Selection or not, doesn't matter
content = content.replace("onKeyDown={e => e.key === 'Enter' && checkGis6()}", "onKeyDown={e => e.key === 'Enter' && checkGis7()}");
content = content.replace("onClick={() => checkGis6('opt1')}", "onClick={() => checkGis7('opt1')}");
content = content.replace("onClick={() => checkGis6('opt2')}", "onClick={() => checkGis7('opt2')}");
content = content.replace("onClick={() => checkGis6('opt3')}", "onClick={() => checkGis7('opt3')}");

// checkGis7 -> checkGis8
content = content.replace("const checkGis7 = () => {", "const checkGis8 = () => {");
content = content.replace("onKeyDown={e => e.key === 'Enter' && checkGis7()}", "onKeyDown={e => e.key === 'Enter' && checkGis8()}");
content = content.replace("onClick={checkGis7}", "onClick={checkGis8}");

// checkGis11 -> checkGis12
content = content.replace("const checkGis11 = () => {", "const checkGis12 = () => {");
content = content.replace("onClick={checkGis11}", "onClick={checkGis12}");

// checkGis13 -> checkGis17
content = content.replace("const checkGis13 = () => {", "const checkGis17 = () => {");
content = content.replace("onKeyDown={e => e.key === 'Enter' && checkGis13()}", "onKeyDown={e => e.key === 'Enter' && checkGis17()}");
content = content.replace("onClick={checkGis13}", "onClick={checkGis17}");

// handleGis10Submit -> handleGis11Submit
content = content.replace("const handleGis10Submit = () => {", "const handleGis11Submit = () => {");
content = content.replace("onClick={handleGis10Submit}", "onClick={handleGis11Submit}");

// Update maps initialization keys:
content = content.replace("if (topicId !== 'gis-10') return", "if (topicId !== 'gis-11') return");
content = content.replace("if (gis10LeafletMap.current) {", "if (gis10LeafletMap.current) {");
content = content.replace("if (!gis10MapRef.current) return", "if (!gis10MapRef.current) return");
content = content.replace("gis10BufferLayers.current = [circle50, circle100]", "gis10BufferLayers.current = [circle50, circle100]");

// Update rendering keys in JSX:
// For banner and descriptive titles:
const repls = [
  ["topicId === 'gis-6' && tStr.gis6_title", "topicId === 'gis-6' && tStr.gis6_title"],
  ["topicId === 'gis-7' && tStr.gis7_title", "topicId === 'gis-7' && tStr.gis7_title"],
  ["topicId === 'gis-8' && tStr.gis8_title", "topicId === 'gis-8' && tStr.gis8_title"],
  ["topicId === 'gis-9' && tStr.gis9_title", "topicId === 'gis-9' && tStr.gis9_title"],
  ["topicId === 'gis-10' && tStr.gis10_title", "topicId === 'gis-10' && tStr.gis10_title"],
  ["topicId === 'gis-11' && tStr.gis11_title", "topicId === 'gis-11' && tStr.gis11_title"],
  ["topicId === 'gis-12' && tStr.gis12_title", "topicId === 'gis-12' && tStr.gis12_title"],
  ["topicId === 'gis-13' && tStr.gis13_title", "topicId === 'gis-13' && tStr.gis13_title"],
  ["topicId === 'gis-14' && tStr.gis14_title", "topicId === 'gis-14' && tStr.gis14_title"],
  ["topicId === 'gis-15' && tStr.gis15_title", "topicId === 'gis-15' && tStr.gis15_title"]
];

// Let's replace simple topicId comparison conditions:
content = content.replace(/topicId === 'gis-6'/g, "topicId === 'gis-7'"); // was SQL, now gis-7
content = content.replace(/topicId === 'gis-7'/g, "topicId === 'gis-8'"); // was PK, now gis-8
content = content.replace(/topicId === 'gis-11'/g, "topicId === 'gis-12'"); // was layout, now gis-12
content = content.replace(/topicId === 'gis-10'/g, "topicId === 'gis-11'"); // was buffer, now gis-11
content = content.replace(/topicId === 'gis-12'/g, "topicId === 'gis-14'"); // was 3D sandbox, now gis-14
content = content.replace(/topicId === 'gis-13'/g, "topicId === 'gis-17'"); // was NDVI, now gis-17

// Add the other banner/description keys in translation strings and components:
content = content.replace(
  "              {topicId === 'gis-14' && tStr.gis14_title}\n              {topicId === 'gis-15' && tStr.gis15_title}",
  "              {topicId === 'gis-14' && tStr.gis14_title}\n              {topicId === 'gis-15' && tStr.gis15_title}\n              {topicId === 'gis-16' && tStr.gis16_title}\n              {topicId === 'gis-17' && tStr.gis17_title}\n              {topicId === 'gis-18' && tStr.gis18_title}\n              {topicId === 'gis-19' && tStr.gis19_title}"
);
content = content.replace(
  "              {topicId === 'gis-14' && tStr.gis14_desc}\n              {topicId === 'gis-15' && tStr.gis15_desc}",
  "              {topicId === 'gis-14' && tStr.gis14_desc}\n              {topicId === 'gis-15' && tStr.gis15_desc}\n              {topicId === 'gis-16' && tStr.gis16_desc}\n              {topicId === 'gis-17' && tStr.gis17_desc}\n              {topicId === 'gis-18' && tStr.gis18_desc}\n              {topicId === 'gis-19' && tStr.gis19_desc}"
);

fs.writeFileSync('/Users/libertywalk/gat/src/pages/Subjects/components/InteractivePracticalTask.jsx', content, 'utf-8');
console.log("Successfully replaced GAT IDs inside InteractivePracticalTask.jsx!");
