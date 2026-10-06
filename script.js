// ==========================================
// DADOS
// ==========================================

let products = [
    {
        sku: "PRD-001",
        name: "Produto A",
        section: "Seção 02",
        stock: 4,
        min: 5
    },
    {
        sku: "PRD-002",
        name: "Produto B",
        section: "Seção 01",
        stock: 18,
        min: 6
    },
    {
        sku: "PRD-003",
        name: "Produto C",
        section: "Seção 03",
        stock: 7,
        min: 6
    },
    {
        sku: "PRD-004",
        name: "Produto D",
        section: "Seção 01",
        stock: 2,
        min: 4
    },
    {
        sku: "PRD-005",
        name: "Produto E",
        section: "Seção 04",
        stock: 32,
        min: 8
    },
    {
        sku: "PRD-006",
        name: "Produto F",
        section: "Seção 02",
        stock: 11,
        min: 9
    }
];


let movements = [
    {
        type: "Venda",
        product: "Produto A",
        quantity: 1
    },
    {
        type: "Reposição",
        product: "Produto B",
        quantity: 15
    },
    {
        type: "Venda",
        product: "Produto D",
        quantity: 1
    }
];


// ==========================================
// FUNÇÕES BÁSICAS
// ==========================================

function $(id) {
    return document.getElementById(id);
}


function status(product) {

    if (product.stock <= product.min) {
        return "urgent";
    }

    if (product.stock <= Math.ceil(product.min * 1.5)) {
        return "low";
    }

    return "normal";
}


function statusText(product) {

    const current = status(product);

    if (current === "urgent") {
        return "Urgente";
    }

    if (current === "low") {
        return "Baixo";
    }

    return "Normal";
}


function statusBadge(product) {

    return `
        <span class="badge badge-${status(product)}">
            ${statusText(product)}
        </span>
    `;
}


function suggestedQuantity(product) {

    return Math.max(
        1,
        product.min * 4 - product.stock
    );
}


// ==========================================
// NAVEGAÇÃO
// ==========================================

function showPage(pageName) {

    document.querySelectorAll(".page").forEach(function(page) {

        page.classList.remove("active");

    });


    const page = $(pageName);

    if (page) {
        page.classList.add("active");
    }


    document.querySelectorAll(".nav-btn").forEach(function(button) {

        button.classList.remove("active");

    });


    const button = document.querySelector(
        `.nav-btn[data-page="${pageName}"]`
    );

    if (button) {
        button.classList.add("active");
    }


    renderAll();
}


document.querySelectorAll(".nav-btn").forEach(function(button) {

    button.addEventListener("click", function() {

        showPage(this.dataset.page);

    });

});


// ==========================================
// DASHBOARD
// ==========================================

function renderDashboard() {

    const total = products.length;


    const normal = products.filter(function(product) {

        return status(product) === "normal";

    }).length;


    const low = products.filter(function(product) {

        return status(product) === "low";

    }).length;


    const urgent = products.filter(function(product) {

        return status(product) === "urgent";

    }).length;


    if ($("total-products")) {
        $("total-products").textContent = total;
    }


    if ($("normal-products")) {
        $("normal-products").textContent = normal;
    }


    if ($("low-products")) {
        $("low-products").textContent = low;
    }


    if ($("urgent-products")) {
        $("urgent-products").textContent = urgent;
    }


    renderAttentionTable();
    renderMovements();
}


// ==========================================
// PRODUTOS EM ATENÇÃO
// ==========================================

function renderAttentionTable() {

    const table = $("attention-table");

    if (!table) {
        return;
    }


    const attention = products.filter(function(product) {

        return status(product) !== "normal";

    });


    if (attention.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    Nenhum produto precisa de atenção.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = attention.map(function(product) {

        const index = products.indexOf(product);

        return `
            <tr>

                <td>${product.sku}</td>

                <td>${product.name}</td>

                <td>${product.section}</td>

                <td>${product.stock}</td>

                <td>${product.min}</td>

                <td>${statusBadge(product)}</td>

                <td>
                    <button
                        class="btn btn-primary"
                        onclick="prepareReplenishment(${index})">
                        Repor
                    </button>
                </td>

            </tr>
        `;

    }).join("");

}


// ==========================================
// MOVIMENTAÇÕES
// ==========================================

function renderMovements() {

    const list = $("movement-list");

    if (!list) {
        return;
    }


    if (movements.length === 0) {

        list.innerHTML = `
            <div class="card-body">
                Nenhuma movimentação registrada.
            </div>
        `;

        return;
    }


    list.innerHTML = movements
        .slice()
        .reverse()
        .slice(0, 10)
        .map(function(movement) {

            const sign =
                movement.type === "Venda"
                    ? "-"
                    : "+";


            return `
                <div class="movement">

                    <div>

                        <div class="movement-name">
                            ${movement.type}
                        </div>

                        <div class="movement-info">
                            ${movement.product}
                        </div>

                    </div>

                    <div class="movement-qty">
                        ${sign}${movement.quantity}
                    </div>

                </div>
            `;

        })
        .join("");
}


// ==========================================
// PRODUTOS
// ==========================================

function renderProducts() {

    const table = $("products-table");

    if (!table) {
        return;
    }


    const searchInput = $("search-product");

    const search = searchInput
        ? searchInput.value.toLowerCase()
        : "";


    const filtered = products.filter(function(product) {

        return (
            product.name.toLowerCase().includes(search) ||
            product.sku.toLowerCase().includes(search)
        );

    });


    if (filtered.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    Nenhum produto encontrado.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = filtered.map(function(product) {

        const index = products.indexOf(product);

        return `
            <tr>

                <td>${product.sku}</td>

                <td>${product.name}</td>

                <td>${product.section}</td>

                <td>${product.stock}</td>

                <td>${product.min}</td>

                <td>${statusBadge(product)}</td>

                <td>

                    <div class="actions">

                        <button
                            class="btn btn-secondary"
                            onclick="openEditProduct(${index})">
                            Editar
                        </button>

                        <button
                            class="btn btn-success"
                            onclick="registerSale(${index})">
                            Venda
                        </button>

                        <button
                            class="btn btn-danger"
                            onclick="deleteProduct(${index})">
                            Excluir
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");

}


// ==========================================
// PESQUISA
// ==========================================

if ($("search-product")) {

    $("search-product").addEventListener(
        "input",
        renderProducts
    );

}


// ==========================================
// MODAL
// ==========================================

function openProductModal() {

    const modal = $("product-modal");

    if (!modal) {
        return;
    }


    modal.classList.add("show");


    if ($("modal-title")) {
        $("modal-title").textContent =
            "Novo produto";
    }


    if ($("product-form")) {
        $("product-form").reset();
    }


    if ($("edit-product-index")) {
        $("edit-product-index").value = "";
    }

}


function closeProductModal() {

    const modal = $("product-modal");

    if (modal) {
        modal.classList.remove("show");
    }

}


function openEditProduct(index) {

    const product = products[index];

    if (!product) {
        return;
    }


    $("product-modal").classList.add("show");


    $("modal-title").textContent =
        "Editar produto";


    $("edit-product-index").value =
        index;


    $("product-sku").value =
        product.sku;


    $("product-name").value =
        product.name;


    $("product-section").value =
        product.section;


    $("product-stock").value =
        product.stock;


    $("product-min").value =
        product.min;

}


// ==========================================
// SALVAR PRODUTO
// ==========================================

if ($("product-form")) {

    $("product-form").addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const sku =
                $("product-sku").value.trim();


            const name =
                $("product-name").value.trim();


            const section =
                $("product-section").value.trim();


            const stock =
                Number($("product-stock").value);


            const min =
                Number($("product-min").value);


            if (!sku || !name || !section) {

                alert("Preencha todos os campos.");

                return;
            }


            if (
                !Number.isFinite(stock) ||
                !Number.isFinite(min) ||
                stock < 0 ||
                min < 0
            ) {

                alert("Informe valores válidos.");

                return;
            }


            const editIndex =
                $("edit-product-index").value;


            const product = {

                sku: sku,

                name: name,

                section: section,

                stock: stock,

                min: min

            };


            if (editIndex === "") {

                products.push(product);

                alert(
                    "Produto adicionado com sucesso!"
                );

            } else {

                products[Number(editIndex)] =
                    product;

                alert(
                    "Produto atualizado com sucesso!"
                );

            }


            closeProductModal();

            renderAll();

        }
    );

}


// ==========================================
// EXCLUIR PRODUTO
// ==========================================

function deleteProduct(index) {

    const product = products[index];

    if (!product) {
        return;
    }


    const confirmDelete = confirm(
        `Deseja excluir o produto "${product.name}"?`
    );


    if (!confirmDelete) {
        return;
    }


    products.splice(index, 1);


    alert(
        "Produto excluído com sucesso!"
    );


    renderAll();

}


// ==========================================
// REGISTRAR VENDA
// ==========================================

function registerSale(index) {

    const product = products[index];

    if (!product) {
        return;
    }


    if (product.stock <= 0) {

        alert(
            "Esse produto está sem estoque."
        );

        return;
    }


    product.stock -= 1;


    movements.push({

        type: "Venda",

        product: product.name,

        quantity: 1

    });


    alert(
        `Venda registrada: ${product.name}`
    );


    renderAll();

}


// ==========================================
// REPOSIÇÃO
// ==========================================

function populateReplenishmentProducts() {

    const select =
        $("replenish-product");


    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            Selecione um produto
        </option>
    `;


    products.forEach(function(product, index) {

        const option =
            document.createElement("option");


        option.value = index;


        option.textContent =
            `${product.sku} - ${product.name}`;


        select.appendChild(option);

    });


    if (
        currentValue !== "" &&
        products[Number(currentValue)]
    ) {

        select.value =
            currentValue;

    }

}


if ($("replenish-product")) {

    $("replenish-product").addEventListener(
        "change",
        function() {

            const section =
                $("replenish-section");


            if (!section) {
                return;
            }


            if (this.value === "") {

                section.value = "";

                return;
            }


            const product =
                products[Number(this.value)];


            if (product) {

                section.value =
                    product.section;

            }

        }
    );

}


// ==========================================
// REGISTRAR REPOSIÇÃO
// ==========================================

if ($("replenishment-form")) {

    $("replenishment-form").addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const productIndex =
                $("replenish-product").value;


            const quantity =
                Number(
                    $("replenish-quantity").value
                );


            if (
                productIndex === "" ||
                !products[Number(productIndex)]
            ) {

                alert(
                    "Selecione um produto."
                );

                return;
            }


            if (
                !Number.isFinite(quantity) ||
                quantity <= 0
            ) {

                alert(
                    "Informe uma quantidade válida."
                );

                return;
            }


            const product =
                products[Number(productIndex)];


            product.stock += quantity;


            movements.push({

                type: "Reposição",

                product: product.name,

                quantity: quantity

            });


            alert(
                `Reposição registrada: +${quantity} ${product.name}`
            );


            this.reset();


            if ($("replenish-section")) {

                $("replenish-section").value = "";

            }


            setCurrentDateTime();


            renderAll();

        }
    );

}


// ==========================================
// PREPARAR REPOSIÇÃO
// ==========================================

function prepareReplenishment(index) {

    showPage("reposicao");


    const select =
        $("replenish-product");


    if (!select) {
        return;
    }


    select.value = index;


    select.dispatchEvent(
        new Event("change")
    );


    const product =
        products[index];


    if (
        product &&
        $("replenish-quantity")
    ) {

        $("replenish-quantity").value =
            suggestedQuantity(product);

    }

}


// ==========================================
// ALERTAS
// ==========================================

function renderAlerts() {

    const container =
        $("alerts-container");


    if (!container) {
        return;
    }


    const alerts =
        products.filter(function(product) {

            return status(product) !== "normal";

        });


    if (alerts.length === 0) {

        container.innerHTML = `
            <div class="content-card">

                <div class="card-body">

                    Nenhum produto precisa
                    de reposição.

                </div>

            </div>
        `;

        return;
    }


    container.innerHTML =
        alerts.map(function(product) {

            const currentStatus =
                status(product);


            const index =
                products.indexOf(product);


            return `
                <div class="alert-card
                    ${currentStatus === "low" ? "low" : ""}">

                    <div class="alert-title">

                        ${
                            currentStatus === "urgent"
                                ? "🔴 Reposição urgente"
                                : "🟡 Estoque baixo"
                        }

                    </div>


                    <div class="alert-info">

                        <strong>
                            ${product.name}
                        </strong>

                        <br>

                        SKU:
                        ${product.sku}

                        <br>

                        Seção:
                        ${product.section}

                        <br>

                        Estoque atual:
                        ${product.stock}

                        <br>

                        Estoque mínimo:
                        ${product.min}

                    </div>


                    <div class="suggestion">

                        Sugestão de reposição:
                        ${suggestedQuantity(product)}
                        unidades

                    </div>


                    <br>


                    <button
                        class="btn btn-primary"
                        onclick="prepareReplenishment(${index})">

                        Registrar reposição

                    </button>

                </div>
            `;

        }).join("");

}


// ==========================================
// DATA E HORA
// ==========================================

function setCurrentDateTime() {

    const now =
        new Date();


    if ($("current-date")) {

        $("current-date").textContent =
            now.toLocaleDateString("pt-BR");

    }


    if ($("replenish-date")) {

        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                now.getDate()
            ).padStart(2, "0");


        $("replenish-date").value =
            `${year}-${month}-${day}`;

    }


    if ($("replenish-time")) {

        const hours =
            String(
                now.getHours()
            ).padStart(2, "0");


        const minutes =
            String(
                now.getMinutes()
            ).padStart(2, "0");


        $("replenish-time").value =
            `${hours}:${minutes}`;

    }

}


// ==========================================
// ATUALIZAÇÃO GERAL
// ==========================================

function renderAll() {

    renderDashboard();

    renderProducts();

    populateReplenishmentProducts();

    renderAlerts();

}


// ==========================================
// INICIAR SISTEMA
// ==========================================

setCurrentDateTime();

renderAll();