const { expect } = require('chai');
const { setupDriver } = require('../utils/webdriver');
const { takeScreenshot } = require('../utils/screenshot');
const AccessPage = require('../pages/AccessPage');
const { until } = require('selenium-webdriver');

describe('HU-01 y HU-06: Pruebas de Acceso y Registro', function() {
    this.timeout(60000); 
    let driver;
    let accessPage;

    beforeEach(async function() {
        driver = await setupDriver();
        accessPage = new AccessPage(driver);
        await accessPage.navigateToAccessPage();
    });

afterEach(async function() {
    if (driver) {
        if (this.currentTest.state === 'failed') {
            await takeScreenshot(driver, this.currentTest.fullTitle());
        }
        await driver.quit();
    } else {
        console.warn("⚠️ Driver no estaba inicializado. Se omitió driver.quit()");
    }
});


    // HU-01: Login - CAMINO FELIZ
    it('should successfully log in as Admin', async function() {
        await accessPage.login('admin', 'password123');
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('dashboard.html', 'El login no redirigió correctamente.');
    });

    // HU-01: Login - PRUEBA NEGATIVA
    it('should show error with invalid credentials', async function() {
        await accessPage.login('admin', 'contraseña_incorrecta');
        await driver.wait(until.elementIsVisible(driver.findElement(accessPage.errorMessage)), 3000);
        const errorMessage = await accessPage.getErrorMessage();
        expect(errorMessage).to.include('inválidas', 'No se mostró el mensaje de error.');
    });

    
    
    // tests/access.test.js (should successfully register a new client)

it('should successfully register a new client', async function() {
    const testUser = `test_${Date.now()}@test.com`;
    await accessPage.register(testUser, 'password123');
    
    // 🚨 Sincronización: Esperar hasta que el elemento de mensaje contenga el texto 'exitoso'
    await driver.wait(until.elementTextContains(driver.findElement(accessPage.registerMessage), 'exitoso'), 3000);

    const successMessage = await driver.findElement(accessPage.registerMessage).getText();
    expect(successMessage).to.include('exitoso', 'El registro no fue exitoso.');
});


});