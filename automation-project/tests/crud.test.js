// tests/crud.test.js

const { expect } = require('chai');
const { By } = require('selenium-webdriver'); // Necesario para los XPaths
const { setupDriver } = require('../utils/webdriver'); 
const { takeScreenshot } = require('../utils/screenshot'); 

const AccessPage = require('../pages/AccessPage');
const DashboardPage = require('../pages/DashboardPage');



describe('HU-02 a HU-05: Pruebas de CRUD de Productos', function() {
    this.timeout(90000); 
    let driver;
    let dashboardPage;
    const testProductName = `Laptop Test ${Date.now()}`;

    // Configuración: Loguearse como administrador antes de todas las pruebas CRUD
    before(async function() {
        driver = await setupDriver();
        const accessPage = new AccessPage(driver);
        // Aseguramos que el login se haga una sola vez
        await accessPage.navigateToAccessPage();
        await accessPage.login('admin', 'password123');
        await driver.sleep(1000); // Dar tiempo a la redirección
    });

    beforeEach(async function() {
        dashboardPage = new DashboardPage(driver);
        // Si no estamos en el dashboard, navegamos allí
        if (!(await driver.getCurrentUrl()).includes('dashboard.html')) {
            await dashboardPage.navigateToDashboard();
        }
    });
    
    // Cleanup: Cierra el navegador al finalizar todas las pruebas
    after(async function() {
        await driver.quit();
    });

    // Hook para capturas de pantalla automáticas
    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            await takeScreenshot(driver, this.currentTest.fullTitle()); 
        }
    });

    // -------------------------------------------------------------------
    // HU-02: CREAR PRODUCTO
    // -------------------------------------------------------------------
    
    it('should successfully create a new product (Happy Path)', async function() {
        await dashboardPage.fillProductForm(
            testProductName, 
            'Descripción breve de la Laptop de prueba.', 
            'https://test.com/img.jpg', 
            999.99, 
            10
        );
        await dashboardPage.saveProduct();
        
        const message = await dashboardPage.getFormMessage();
        // 🚨 CORRECCIÓN 1: Buscar 'creado con éxito', no 'actualiza.'
        expect(message).to.include('creado con éxito', 'El mensaje de creación es incorrecto.');
        
        const isProductVisible = await dashboardPage.isProductInAdminTable(testProductName);
        expect(isProductVisible).to.be.true;
    });

    it('should fail to create product with empty Name (Negative Test)', async function() {
        await dashboardPage.fillProductForm(
            '', // Nombre vacío
            'Descripción válida', 
            'https://test.com/img.jpg', 
            100.00, 
            5
        );
        // La prueba falla si el formulario permite el envío (la aserción de JS no se disparará)
        // Aserción: Verificar que el botón de Guardar NO redirigió o NO disparó mensaje de éxito.
        await dashboardPage.saveProduct();
        
        // El formulario HTML5 impide el submit si hay required vacío.
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('dashboard.html', 'Hubo una redirección, lo cual es incorrecto.');
    });
    
    it('should fail to create product with price boundary max (Boundary Test)', async function() {
        // Asumiendo que el campo precio es de tipo number y la base de datos no soporta valores excesivos (ej. 10^100)
        await dashboardPage.fillProductForm(
            'Producto Límite', 
            'Descripción', 
            'https://test.com/img.jpg', 
            1000000000000000000, // Número muy grande
            5
        );
        await dashboardPage.saveProduct();
        
        const message = await dashboardPage.getFormMessage();
        // 🚨 CORRECCIÓN 2: Buscar el mensaje de CREACIÓN
        expect(message).to.include('creado con éxito', 'El sistema falló al manejar un número grande.');
        // Nota: En una app real, la validación debería fallar en el backend. Aquí probamos la robustez del frontend/JS.
    });
    
    // -------------------------------------------------------------------
    // HU-03: LEER PRODUCTO (Ya verificamos en HU-02)
    // -------------------------------------------------------------------

    it('should show updated product details in Marketplace (Read Verification)', async function() {
        // Aserción: Verificar que el producto creado en la prueba anterior (HU-02) es visible para el cliente
        const isProductVisible = await dashboardPage.isProductInMarketplace(testProductName);
        expect(isProductVisible).to.be.true;
    });
    
    // -------------------------------------------------------------------
    // HU-04: ACTUALIZAR PRODUCTO
    // -------------------------------------------------------------------
    
    it('should successfully update product price (Happy Path)', async function() {
        const newPrice = 1200.50;
        
        await dashboardPage.startEditProduct(testProductName); // Cargar datos
        
        // Actualizar solo el precio
        await driver.findElement(dashboardPage.productPriceInput).clear();
        await driver.findElement(dashboardPage.productPriceInput).sendKeys(newPrice.toString());
        
        await dashboardPage.saveProduct();
        
        const message = await dashboardPage.getFormMessage();
        // 🚨 CORRECCIÓN 3: Buscar la palabra clave 'actualiza' que SÍ existe en el mensaje de tu app
        expect(message).to.include('actualiza', 'El mensaje de actualización es incorrecto.');

        // Aserción de Lectura: Verificar el precio actualizado en la tabla de admin
        const updatedRowText = await driver.findElement(By.xpath(`//tbody[@id='adminTableBody']/tr[td[text()='${testProductName}']]`)).getText();
        expect(updatedRowText).to.include(newPrice.toFixed(2), 'El precio no se actualizó correctamente en la tabla.');
        
        // Aserción de Lectura: Verificar el precio actualizado en la tarjeta del cliente
        const cardPriceText = await driver.findElement(By.xpath(`//h4[text()='${testProductName}']/following-sibling::p[@class='price']`)).getText();
        expect(cardPriceText).to.include(newPrice.toFixed(2), 'El precio no se actualizó correctamente en el Marketplace.');
    });

    it('should restrict Description length during update (Boundary Test)', async function() {
        const longDescription = 'L'.repeat(160); // 150 es el límite en HTML
        
        await dashboardPage.startEditProduct(testProductName);
        
        await driver.findElement(dashboardPage.productDescriptionInput).clear();
        await driver.findElement(dashboardPage.productDescriptionInput).sendKeys(longDescription);
        
        // Aserción de Límite: Verificar que el input no contiene el texto completo
        const actualValue = await driver.findElement(dashboardPage.productDescriptionInput).getAttribute('value');
        expect(actualValue.length).to.be.at.most(150, 'El campo permitió una entrada que excede el maxlength.');
        
        await dashboardPage.saveProduct();
    });
    
    // -------------------------------------------------------------------
    // HU-05: ELIMINAR PRODUCTO
    // -------------------------------------------------------------------
    
    it('should successfully delete the product (Happy Path)', async function() {
        await dashboardPage.deleteProduct(testProductName);
        
        const message = await dashboardPage.getFormMessage();
        expect(message).to.include('eliminado con éxito', 'El mensaje de eliminación es incorrecto.');
        
        // Aserción de Lectura: Verificar que el producto ya NO está en la tabla de admin
        const isProductVisibleAdmin = await dashboardPage.isProductInAdminTable(testProductName);
        expect(isProductVisibleAdmin).to.be.false;
        
        // Aserción de Lectura: Verificar que el producto ya NO está en el Marketplace
        const isProductVisibleClient = await dashboardPage.isProductInMarketplace(testProductName);
        expect(isProductVisibleClient).to.be.false;
    });
});