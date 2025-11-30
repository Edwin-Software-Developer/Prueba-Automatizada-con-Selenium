const { By } = require('selenium-webdriver');

class AccessPage {
    constructor(driver) {
        this.driver = driver;
        this.url = 'http://127.0.0.1:5500/index.html'; // **ACTUALIZA ESTA RUTA**
        
        // Selectores de Login (HU-01)
        this.usernameInput = By.id('username');
        this.passwordInput = By.id('password');
        this.loginButton = By.id('loginButton');
        this.errorMessage = By.id('errorMessage');
        
        // Selectores de Registro (HU-06)
        this.showRegisterBtn = By.id('showRegisterBtn');
        this.regUsernameInput = By.id('regUsername');
        this.regPasswordInput = By.id('regPassword');
        this.registerButton = By.id('registerButton');
        this.registerMessage = By.id('registerMessage');
    }

    async navigateToAccessPage() {
        await this.driver.get(this.url);
    }

    async login(username, password) {
        await this.driver.findElement(this.usernameInput).sendKeys(username);
        await this.driver.findElement(this.passwordInput).sendKeys(password);
        await this.driver.findElement(this.loginButton).click();
    }

    async register(username, password) {
        await this.driver.findElement(this.showRegisterBtn).click();
        await this.driver.findElement(this.regUsernameInput).sendKeys(username);
        await this.driver.findElement(this.regPasswordInput).sendKeys(password);
        await this.driver.findElement(this.registerButton).click();
    }
    
    // Métodos para Aserciones
    async getErrorMessage() {
        return await this.driver.findElement(this.errorMessage).getText();
    }
    // ... otros métodos de aserción ...
}

module.exports = AccessPage;