// ============================================================
// CONTROLE DE REPOSIÇÃO
// Sistema independente para VS Code
// ============================================================


// ================= DADOS INICIAIS =================

const products = [

    {
        id: 1,
        sku: "PRD-001",
        name: "Produto A",
        section: "Seção 02",
        stock: 4,
        min: 5,
        alertAt: "2026-10-06T09:20:00"
    },

    {
        id: 2,
        sku: "PRD-002",
        name: "Produto B",
        section: "Seção 01",
        stock: 18,
        min: 6,
        alertAt: null
    },

    {
        id: 3,
        sku: "PRD-003",
        name: "Produto C",
        section: "Seção 03",
        stock: 7,
        min: 6,
        alertAt: null
    },

    {
        id: 4,
        sku: "PRD-004",
        name: "Produto D",
        section: "Seção 01",
        stock: 2,
        min: 4,
        alertAt: "2026-10-06T10:35:00"
    },

    {
        id: 5,
        sku: "PRD-005",
        name: "Produto E",
        section: "Seção 04",
        stock: 32,
        min: 8,
        alertAt: null
    },

    {
        id: 6,
        sku: "PRD-006",
        name: "Produto F",
        section: "Seção 02",
        stock: 11,
        min: 9,
        alertAt: null
    }

];


const movements = [

    {
        kind: "Venda",
        name: "Produto A",
        quantity: 1,
        at: "2026-10-06T09:20:00"
    },

    {
        kind: "Reposição",
        name: "Produto B",
        quantity: 15,
        at: "2026-10-06T09:05:00"
    },

    {
        kind: "Venda",
        name: "Produto D",
        quantity: 1,
        at: "2026-10-06T08:40:00"
    }

];


let nextId = 7;
let editingProductId = null;


// ================= UTILITÁRIOS =================

function $(id) {
    return document.getElementById(id);
}


function escapeHtml(value) {

    return String(value).replace(/[&<>"']/g, char => {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];

    });

}


function dateTime(iso) {

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(new Date(iso));

}


// ================= STATUS DO PRODUTO =================

function status(product) {

    if (product.stock <= product.min) {
        return "urgent";
    }

    if (product.stock <= Math.ceil(product.min * 1.5)) {
        return "low";
    }

    return "normal";
}


function badge(product) {

    const productStatus = status(product);

    let label;

    if (productStatus === "urgent") {
        label = "Necessita reposição";
    }

    else if (productStatus === "low") {
        label = "Estoque baixo";
    }

    else {
        label = "Normal";
    }

    return `
        <span class="badge badge-${productStatus}">
            ${label}
        </span>
    `;
}


// ================= NOTIFICAÇÕES =================

function notify(message, error = false) {

    const notice = $("notice");

    notice.textContent = message;

    notice.className = `
        notice
        ${error ? "error" : "success"}
    `;

    setTimeout(() => {
        notice.classList.add("hidden");
    }, 4000);

}


// ================= NAVEGAÇÃO =================

function switchView(view) {

    document.querySelectorAll(".section-view").forEach(section => {

        section.classList.toggle(
            "hidden",
            section.id !== view
        );

    });


    document.querySelectorAll(".nav-button").forEach(button => {

        const active = button.dataset.view === view;

        button.classList.toggle("active", active);

    });


    const titles = {

        dashboard: "Dashboard",

        produtos: "Produtos",

        reposicao: "Registrar Reposição",

        alertas: "Alertas de Reposição"

    };


    $("active-title").textContent = titles[view];

}


// ================= ATUALIZAÇÃO DA SEÇÃO =================

function updateSection() {

    const product = products.find(
        item => String(item.id) === $("replenish-product").value
    );


    $("replenish-section").value =
        product ? product.section : "";

}


// ================= RENDERIZAÇÃO =================

function render() {

    const urgent = products.filter(
        product => status(product) === "urgent"
    );


    const attention = products.filter(
        product => status(product) !== "normal"
    );


    // ---------------- MÉTRICAS ----------------

    $("metric-total").textContent =
        products.length;


    $("metric-normal").textContent =
        products.filter(
            product => status(product) === "normal"
        ).length;


    $("metric-low").textContent =
        products.filter(
            product => status(product) === "low"
        ).length;


    $("metric-urgent").textContent =
        urgent.length;


    $("nav-alert-count").textContent =
        urgent.length;


    // ---------------- ATENÇÃO ----------------

    $("attention-count").textContent =
        `${attention.length} produto${attention.length === 1 ? "" : "s"}`;


    $("attention-empty").classList.toggle(
        "hidden",
        attention.length !== 0
    );


    $("attention-body").innerHTML =
        attention.map(product => `

            <tr>

                <td>
                    <strong>
                        ${escapeHtml(product.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(product.section)}
                </td>

                <td>
                    ${product.stock} unidades
                </td>

                <td>
                    Mínimo: ${product.min}
                </td>

                <td>
                    ${badge(product)}
                </td>

                <td>

                    <button
                        class="btn-secondary"
                        data-replenish="${product.id}"
                    >
                        Repor
                    </button>

                </td>

            </tr>

        `).join("");


    // ---------------- PRODUTOS ----------------

    $("products-body").innerHTML =
        products.map(product => `

            <tr>

                <td>
                    <strong>
                        ${escapeHtml(product.sku)}
                    </strong>
                </td>

                <td>
                    <strong>
                        ${escapeHtml(product.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(product.section)}
                </td>

                <td>
                    ${product.stock} unidades
                </td>

                <td>
                    ${product.min} unidades
                </td>

                <td>
                    ${badge(product)}
                </td>

                <td>

                    <button
                        class="btn-secondary"
                        data-edit-product="${product.id}"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-secondary"
                        data-delete-product="${product.id}"
                    >
                        Remover
                    </button>

                    <button
                        class="btn-secondary"
                        data-sale="${product.id}"
                        ${product.stock === 0 ? "disabled" : ""}
                    >
                        Registrar venda
                    </button>

                </td>

            </tr>

        `).join("");


    // ---------------- ALERTAS ----------------

    $("alerts-empty").classList.toggle(
        "hidden",
        urgent.length !== 0
    );


    $("alerts-list").innerHTML =
        urgent.map(product => `

            <article class="card alert-card">

                <div class="alert-title">

                    <div class="alert-icon">
                        ⚠
                    </div>

                    <div>

                        <h2>
                            ${escapeHtml(product.name)}
                        </h2>

                        <p>
                            ${escapeHtml(product.section)}
                        </p>

                    </div>

                </div>


                <div class="alert-data">

                    <div>

                        <span>
                            Estoque atual
                        </span>

                        <strong>
                            ${product.stock} unidades
                        </strong>

                    </div>


                    <div>

                        <span>
                            Estoque mínimo
                        </span>

                        <strong>
                            ${product.min} unidades
                        </strong>

                    </div>


                    <div class="suggested">

                        <span>
                            Quantidade sugerida
                        </span>

                        <strong>
                            Repor ${Math.max(
                                1,
                                product.min * 4 - product.stock
                            )} unidades
                        </strong>

                    </div>

                </div>


                <div class="alert-date">

                    Alerta:
                    ${dateTime(
                        product.alertAt ||
                        new Date().toISOString()
                    )}

                </div>


                <button
                    class="btn-primary"
                    style="width:100%"
                    data-replenish="${product.id}"
                >
                    Marcar como reposto
                </button>

            </article>

        `).join("");


    // ---------------- MOVIMENTAÇÕES ----------------

    $("movement-list").innerHTML =
        movements.slice(0, 5).map(movement => `

            <div class="movement">

                <span
                    class="
                        movement-dot
                        ${
                            movement.kind === "Venda"
                            ? "movement-sale"
                            : "movement-replenishment"
                        }
                    "
                ></span>


                <div class="movement-info">

                    <p>
                        <strong>
                            ${escapeHtml(movement.kind)}
                        </strong>
                        ·
                        ${escapeHtml(movement.name)}
                    </p>

                    <small>
                        ${
                            movement.kind === "Venda"
                            ? "−"
                            : "+"
                        }

                        ${movement.quantity}

                        ${
                            movement.quantity === 1
                            ? "unidade"
                            : "unidades"
                        }
                    </small>

                </div>


                <time>
                    ${dateTime(movement.at)}
                </time>

            </div>

        `).join("");


    // ---------------- SELECT ----------------

    const select = $("replenish-product");

    const selected = select.value;


    select.innerHTML = `

        <option value="">
            Selecione um produto
        </option>

        ${products.map(product => `

            <option value="${product.id}">

                ${escapeHtml(product.name)}
                ·
                ${escapeHtml(product.sku)}

            </option>

        `).join("")}

    `;


    select.value = selected;

    updateSection();

}


// ================= ABRIR REPOSIÇÃO =================

function openReplenishment(id) {

    switchView("reposicao");


    const product =
        products.find(item => item.id === id);


    if (!product) {
        return;
    }


    $("replenish-product").value =
        String(id);


    $("replenish-quantity").value =
        Math.max(
            1,
            product.min * 4 - product.stock
        );


    updateSection();


    $("replenish-quantity").focus();

}


// ================= MENU =================

document.querySelectorAll(".nav-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            switchView(
                button.dataset.view
            );

        });

    });


// ================= AÇÕES DAS TABELAS =================

document.addEventListener("click", event => {


    // ---------- REPOR ----------

    const replenishButton =
        event.target.closest("[data-replenish]");


    if (replenishButton) {

        openReplenishment(
            Number(
                replenishButton.dataset.replenish
            )
        );

        return;
    }


    // ---------- EDITAR ----------

    const editButton =
        event.target.closest("[data-edit-product]");


    if (editButton) {

        const product =
            products.find(
                item =>
                    item.id ===
                    Number(
                        editButton.dataset.editProduct
                    )
            );


        if (!product) {
            return;
        }


        editingProductId = product.id;


        $("new-sku").value =
            product.sku;

        $("new-name").value =
            product.name;

        $("new-section").value =
            product.section;

        $("new-stock").value =
            product.stock;

        $("new-minimum").value =
            product.min;


        switchView("produtos");


        $("product-form")
            .classList.remove("hidden");


        $("product-form-heading")
            .textContent =
            "Editar produto";


        $("new-sku").focus();


        return;
    }


    // ---------- REMOVER ----------

    const deleteButton =
        event.target.closest("[data-delete-product]");


    if (deleteButton) {

        const id =
            Number(
                deleteButton.dataset.deleteProduct
            );


        const index =
            products.findIndex(
                item => item.id === id
            );


        if (index < 0) {
            return;
        }


        const removed =
            products.splice(index, 1)[0];


        render();


        notify(
            `${removed.name} removido.`
        );


        return;
    }


    // ---------- VENDA ----------

    const saleButton =
        event.target.closest("[data-sale]");


    if (saleButton) {

        const product =
            products.find(
                item =>
                    item.id ===
                    Number(
                        saleButton.dataset.sale
                    )
            );


        if (
            !product ||
            product.stock < 1
        ) {
            return;
        }


        const previousStatus =
            status(product);


        product.stock -= 1;


        if (
            previousStatus !== "urgent" &&
            status(product) === "urgent"
        ) {

            product.alertAt =
                new Date().toISOString();

        }


        movements.unshift({

            kind: "Venda",

            name: product.name,

            quantity: 1,

            at: new Date().toISOString()

        });


        render();


        notify(
            `Venda de ${product.name} registrada. Estoque atual: ${product.stock} unidades.`
        );

    }

});


// ================= NOVO PRODUTO =================

$("open-product-form")
    .addEventListener("click", () => {

        editingProductId = null;


        $("product-form").reset();


        $("product-form-heading")
            .textContent =
            "Cadastrar produto";


        $("product-form")
            .classList.remove("hidden");


        $("new-sku").focus();

    });


// ================= CANCELAR PRODUTO =================

$("cancel-product")
    .addEventListener("click", () => {

        editingProductId = null;


        $("product-form").reset();


        $("product-form")
            .classList.add("hidden");

    });


// ================= SALVAR PRODUTO =================

$("product-form")
    .addEventListener("submit", event => {

        event.preventDefault();


        const sku =
            $("new-sku").value.trim();


        const name =
            $("new-name").value.trim();


        const section =
            $("new-section").value.trim();


        const stock =
            Number(
                $("new-stock").value
            );


        const min =
            Number(
                $("new-minimum").value
            );


        // VALIDAÇÃO

        if (

            !sku ||
            !name ||
            !section ||
            !Number.isInteger(stock) ||
            stock < 0 ||
            !Number.isInteger(min) ||
            min < 1

        ) {

            notify(
                "Preencha todos os campos com valores válidos.",
                true
            );

            return;
        }


        // SKU DUPLICADO

        const duplicate =
            products.some(product =>

                product.sku.toLowerCase() ===
                sku.toLowerCase() &&

                product.id !==
                editingProductId

            );


        if (duplicate) {

            notify(
                "Este SKU já está cadastrado.",
                true
            );

            return;
        }


        // EDITAR

        if (editingProductId !== null) {

            const product =
                products.find(
                    item =>
                        item.id ===
                        editingProductId
                );


            if (!product) {
                return;
            }


            Object.assign(product, {

                sku,

                name,

                section,

                stock,

                min,

                alertAt:
                    stock <= min
                        ? (
                            product.alertAt ||
                            new Date().toISOString()
                        )
                        : null

            });


            notify(
                `${name} atualizado com sucesso.`
            );

        }


        // NOVO

        else {

            products.push({

                id: nextId++,

                sku,

                name,

                section,

                stock,

                min,

                alertAt:
                    stock <= min
                        ? new Date().toISOString()
                        : null

            });


            notify(
                `${name} cadastrado com sucesso.`
            );

        }


        editingProductId = null;


        $("product-form").reset();


        $("product-form")
            .classList.add("hidden");


        render();

    });


// ================= SELECT PRODUTO =================

$("replenish-product")
    .addEventListener(
        "change",
        updateSection
    );


// ================= REPOSIÇÃO =================

$("replenishment-form")
    .addEventListener("submit", event => {

        event.preventDefault();


        const product =
            products.find(
                item =>
                    String(item.id) ===
                    $("replenish-product").value
            );


        const quantity =
            Number(
                $("replenish-quantity").value
            );


        const date =
            $("replenish-date").value;


        const time =
            $("replenish-time").value;


        const replenishmentDate =
            new Date(
                `${date}T${time}`
            );


        if (

            !product ||

            !Number.isInteger(quantity) ||

            quantity < 1 ||

            !date ||

            !time ||

            Number.isNaN(
                replenishmentDate.getTime()
            )

        ) {

            notify(
                "Informe produto, quantidade, data e horário válidos.",
                true
            );

            return;
        }


        // ADICIONA ESTOQUE

        product.stock += quantity;


        // REMOVE ALERTA

        if (
            product.stock > product.min
        ) {

            product.alertAt = null;

        }


        // REGISTRA MOVIMENTAÇÃO

        movements.unshift({

            kind: "Reposição",

            name: product.name,

            quantity,

            at: replenishmentDate.toISOString()

        });


        // RESUMO

        $("replenishment-summary")
            .innerHTML = `

                <p>
                    <strong>
                        ${escapeHtml(product.name)}
                    </strong>
                </p>

                <p>
                    Quantidade reposta:
                    <strong>
                        ${quantity} unidades
                    </strong>
                </p>

                <p>
                    Estoque após reposição:
                    <strong>
                        ${product.stock} unidades
                    </strong>
                </p>

            `;


        $("replenish-quantity").value = "";


        render();


        notify(
            `Reposição de ${product.name} registrada com sucesso.`
        );

    });


// ================= DATA E HORA =================

const now = new Date();


$("replenish-date").value =
    `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}-${String(
        now.getDate()
    ).padStart(2, "0")}`;


$("replenish-time").value =
    `${String(
        now.getHours()
    ).padStart(2, "0")}:${String(
        now.getMinutes()
    ).padStart(2, "0")`;


// ================= INICIALIZAÇÃO =================

switchView("dashboard");

render();