const { By, until, Key } = require('selenium-webdriver');

class DashboardPage {
    constructor(driver) {
        this.driver = driver;
        this.url = 'http://127.0.0.1:5500/index.html'; // **ACTUALIZA ESTA RUTA**

        // --- Selectores del Formulario CRUD (Crear/Actualizar) ---
        this.productForm = By.id('productForm');
        this.productIdInput = By.id('productId'); // Hidden ID para Actualizar
        this.productNameInput = By.id('productName');
        this.productDescriptionInput = By.id('productDescription');
        this.productImageUrlInput = By.id('productImageUrl');
        this.productPriceInput = By.id('productPrice');
        this.productStockInput = By.id('productStock');
        this.saveButton = By.id('saveButton');
        this.formMessage = By.id('formMessage'); // Mensajes de éxito/error del CRUD

        // --- Selectores de la Tabla de Administración (Leer/Acciones) ---
        this.adminPanel = By.id('adminPanel'); // Para verificar visibilidad
        this.adminTableBody = By.id('adminTableBody');

        // --- Selectores de la Vista de Cliente (Marketplace) ---
        this.productCardsContainer = By.id('productCardsContainer');
    }

    async navigateToDashboard() {
        await this.driver.get(this.url);
        // Esperar a que el panel de administración esté presente (aunque pueda estar oculto)
        await this.driver.wait(until.elementLocated(this.adminPanel), 10000);
    }

    // --- Métodos de CRUD ---
    
    // Método para Crear/Actualizar un Producto
    async fillProductForm(name, description, imageUrl, price, stock) {
        // Limpiar el formulario y luego llenarlo
        await this.driver.findElement(this.productNameInput).clear();
        await this.driver.findElement(this.productNameInput).sendKeys(name);
        
        await this.driver.findElement(this.productDescriptionInput).clear();
        await this.driver.findElement(this.productDescriptionInput).sendKeys(description);
        
        await this.driver.findElement(this.productImageUrlInput).clear();
        await this.driver.findElement(this.productImageUrlInput).sendKeys(imageUrl);
        
        await this.driver.findElement(this.productPriceInput).clear();
        await this.driver.findElement(this.productPriceInput).sendKeys(price.toString());
        
        await this.driver.findElement(this.productStockInput).clear();
        await this.driver.findElement(this.productStockInput).sendKeys(stock.toString());
    }

    async saveProduct() {
        await this.driver.findElement(this.saveButton).click();
        // Esperar a que aparezca el mensaje de éxito/error
        await this.driver.wait(until.elementLocated(this.formMessage), 5000);
    }

    // Método para Iniciar la Edición (Update)
    async startEditProduct(productName) {
        // Encontrar la fila que contiene el nombre del producto
        const row = await this.driver.findElement(By.xpath(`//tbody[@id='adminTableBody']/tr[td[text()='${productName}']]`));
        // Encontrar el botón 'Editar' dentro de esa fila
        const editButton = await row.findElement(By.className('edit-button'));
        await editButton.click();
        // Esperar a que el formulario se cargue con los datos del producto
        await this.driver.wait(until.elementLocated(this.productIdInput), 5000);
    }

    // Método para Eliminar (Delete)
    async deleteProduct(productName) {
        // Encontrar la fila que contiene el nombre del producto
        const row = await this.driver.findElement(By.xpath(`//tbody[@id='adminTableBody']/tr[td[text()='${productName}']]`));
        // Encontrar el botón 'Eliminar' dentro de esa fila
        const deleteButton = await row.findElement(By.className('delete-button'));
        await deleteButton.click();
        
        // Manejar el cuadro de diálogo 'confirm' del navegador
        await this.driver.wait(until.alertIsPresent(), 2000);
        await this.driver.switchTo().alert().accept();
    }
    
    // --- Métodos de Aserción y Verificación ---
    
    // Verifica si un producto aparece en la tabla de Administración (READ - Admin)
    async isProductInAdminTable(productName) {
        // Usamos XPath para buscar el nombre en la tabla
        const xpath = `//tbody[@id='adminTableBody']/tr/td[text()='${productName}']`;
        try {
            await this.driver.wait(until.elementLocated(By.xpath(xpath)), 2000);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Verifica si un producto aparece en la vista de Tarjetas (READ - Cliente)
    async isProductInMarketplace(productName) {
        // Buscamos el H4 que contiene el ID de la tarjeta con el nombre
        const xpath = `//div[@id='productCardsContainer']//h4[text()='${productName}']`;
        try {
            await this.driver.wait(until.elementLocated(By.xpath(xpath)), 2000);
            return true;
        } catch (e) {
            return false;
        }
    }

    async getFormMessage() {
        return await this.driver.findElement(this.formMessage).getText();
    }
}

module.exports = DashboardPage;