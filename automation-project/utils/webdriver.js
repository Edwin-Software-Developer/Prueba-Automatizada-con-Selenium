// utils/webdriver.js

const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// 🚨 Asegúrate de que esta ruta sea la ABSOLUTA de tu Brave Browser
const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'; 
// Usaremos el path de chromedriver que instalaste en node_modules
const chromeDriverService = require('chromedriver').path; 


async function setupDriver() {
    
    // 1. Crear el objeto ServiceBuilder con la ruta del driver
    let service = new chrome.ServiceBuilder(chromeDriverService);
    
    // 2. Opciones de Chrome/Brave
    let options = new chrome.Options();
    
    // 3. PASO CLAVE PARA BRAVE
    options.setChromeBinaryPath(BRAVE_PATH); 
    
    options.addArguments('--start-maximized');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--no-sandbox'); 

    // 4. Crear el driver
    let driver = await new Builder()
        .forBrowser(Browser.CHROME) 
        .setChromeOptions(options)
        // 🚨 IMPORTANTE: Pasar el objeto service, NO el resultado de .build()
        .setChromeService(service) 
        .build();
        
    return driver;
}

module.exports = { setupDriver };