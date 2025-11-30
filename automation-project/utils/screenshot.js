const fs = require('fs');

async function takeScreenshot(driver, testName) {
    // Reemplaza caracteres no válidos para el nombre de archivo
    const cleanTestName = testName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50); 
    const dir = './reports/screenshots';
    const filePath = `${dir}/FAIL_${cleanTestName}_${Date.now()}.png`;

    // Asegurarse de que el directorio exista
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    
    const data = await driver.takeScreenshot();
    fs.writeFileSync(filePath, data, 'base64');
    console.log(`\n📸 Captura guardada en: ${filePath}`);
}

module.exports = { takeScreenshot };