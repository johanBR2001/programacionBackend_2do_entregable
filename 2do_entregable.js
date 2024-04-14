const fs = require('fs');

class ProductManager {
    constructor(filePath) {
        // Guardo la ruta del archivo donde se almacenarán los productos.
        this.filePath = filePath;
        this.products = [];
        this.currentId = 0;
        // Cargo los productos desde el archivo al inicializar la instancia.
        this.loadProducts();
    }

    loadProducts() {
        try {
            // Intento leer el archivo especificado.
            const data = fs.readFileSync(this.filePath, 'utf8');
            if (data) {
                // Si hay datos, los convierto de JSON a objetos de JavaScript.
                this.products = JSON.parse(data);
                // Actualizo el ID actual al máximo encontrado para evitar duplicados.
                this.currentId = this.products.reduce((maxId, product) => Math.max(maxId, product.id), 0);
            }
        } catch (error) {
            // Si ocurre algún error al cargar el archivo, lo registro y reinicio la lista de productos.
            console.error('Error al cargar los productos:', error);
            this.products = [];
        }
    }

    saveProducts() {
        try {
            // Convierto la lista de productos a una cadena JSON y la escribo en el archivo.
            fs.writeFileSync(this.filePath, JSON.stringify(this.products, null, 2), 'utf8');
        } catch (error) {
            // Registro errores si no puedo guardar los productos correctamente.
            console.error('Error al guardar los productos:', error);
        }
    }

    getProducts() {
        // Devuelvo la lista actual de productos.
        return this.products;
    }

    addProduct({ title, description, price, thumbnail, code, stock }) {
        // Añado un nuevo producto asegurándome de que todos los campos necesarios estén presentes.
        const newProduct = {
            id: ++this.currentId, // Incremento el ID para cada nuevo producto.
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        };
        this.products.push(newProduct);
        this.saveProducts(); // Guardo la lista de productos cada vez que agrego uno nuevo.
        return newProduct;
    }

    getProductById(id) {
        // Busco un producto por ID.
        const product = this.products.find(p => p.id === id);
        if (!product) {
            // Si el producto no se encuentra, lanzo una excepción.
            throw new Error("Producto no encontrado.");
        }
        return product;
    }

    updateProduct(id, updates) {
        // Actualizo un producto existente con nuevos valores para ciertos campos.
        const product = this.getProductById(id);
        Object.keys(updates).forEach(key => {
            if (key !== 'id') { // Aseguro de no modificar el ID.
                product[key] = updates[key];
            }
        });
        this.saveProducts(); // Guardo los cambios en el archivo.
        return product;
    }

    deleteProduct(id) {
        // Elimino un producto basándome en su ID.
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            // Si no encuentro el producto, lanzo una excepción.
            throw new Error("Producto no encontrado.");
        }
        this.products.splice(index, 1);
        this.saveProducts(); // Guardo la lista actualizada de productos después de eliminar uno.
    }
}

function testProductManager() {
    const manager = new ProductManager('products.json');

    // Pruebas básicas para verificar la funcionalidad de la clase.
    console.log("Probando getProducts en un gestor vacío:");
    console.log(manager.getProducts()); // Debería mostrar una lista vacía si es la primera ejecución.

    console.log("Agregando un producto:");
    const product = manager.addProduct({
        title: "producto prueba",
        description: "Este es un producto prueba",
        price: 200,
        thumbnail: "Sin imagen",
        code: "abc123",
        stock: 25
    });
    console.log(product); // Muestro el producto recién agregado.

    console.log("Probando getProducts después de agregar un producto:");
    console.log(manager.getProducts()); // Debería mostrar la lista de productos incluyendo el nuevo.

    console.log("Probando getProductById:");
    console.log(manager.getProductById(product.id)); // Debería encontrar el producto por su ID.

    console.log("Probando updateProduct:");
    manager.updateProduct(product.id, { price: 250 });
    console.log(manager.getProductById(product.id)); // Verifico que el precio se haya actualizado.

    console.log("Probando deleteProduct:");
    manager.deleteProduct(product.id);
    console.log(manager.getProducts()); // Debería mostrar una lista vacía nuevamente.

    console.log("Manejando errores en getProductById:");
    try {
        manager.getProductById(product.id);
    } catch (error) {
        console.log(error.message); // Esperado si el producto fue eliminado: "Producto no encontrado."
    }
}

testProductManager();
