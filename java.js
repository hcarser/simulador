const TRANSLATIONS = {
            "es-ES": {
                "title": "Simulador de Mercado Local",
                "subtitle": "🍎 ¡Compra productos frescos!",
                "moveInstruction": "Usa WASD para moverte",
                "lookInstruction": "Flechas Izq/Der o ratón para mirar",
                "interactInstruction": "Presiona E para hablar",
                "closeInstruction": "Presiona ESC para salir",
                "pressEToTalkTo": "Presiona E para hablar con",
                "todaysOffer": "¡Bienvenido/a a mi puesto! ¿Qué se le ofrece?",
                "addToCartButton": "Añadir",
                "cartTitle": "Su Canasta",
                "payButton": "Pagar",
                "budgetLabel": "Presupuesto",
                "welcomeMessage": "¡Bienvenido/a al mercado,",
                "winMessage": "¡Felicidades! ¡Completaste tu lista de compras!",
                "listButton": "Ver Mi Lista",
                "listTitle": "Mi Lista de Compras",
                "closeButton": "Cerrar",
                "askPlaceholder": "Haz una pregunta...",
                "askButton": "Preguntar",
                "thinking": "Pensando...",
                "payWith": "Pagar con",
                "exacto": "Exacto",
                "change": "Cambio",
                "confirm_add": "Sí, agregar",
                "confirm_cancel": "No, gracias",
                // --- CORREGIDO: Traducciones para unidades ---
                "unit_pound": "libra",
                "unit_each": "unidad"
            }
        };
        const t = (key) => TRANSLATIONS["es-ES"][key] || key;

        let playerBudget = 50.00;
        let playerName = "";
        let shoppingList = [];

        const budgetDisplayDiv = document.getElementById('budget-display');
        const subtitleEl = document.getElementById('subtitle');
        const toggleListBtn = document.getElementById('toggle-list-btn');
        const shoppingListModal = document.getElementById('shopping-list-modal');
        const shoppingListItemsEl = document.getElementById('shopping-list-items');
        const closeListBtn = document.getElementById('close-list-btn');

        document.getElementById('title').textContent = t('title');
        subtitleEl.textContent = t('subtitle');
        document.getElementById('move-instruction').textContent = t('moveInstruction');
        document.getElementById('look-instruction').textContent = t('lookInstruction');
        document.getElementById('interact-instruction').textContent = t('interactInstruction');
        document.getElementById('close-instruction').textContent = t('closeInstruction');
        document.getElementById('cart-title').textContent = t('cartTitle');
        toggleListBtn.textContent = t('listButton');
        document.querySelector('#shopping-list-content h3').textContent = t('listTitle');
        closeListBtn.textContent = t('closeButton');
        
        function updateBudgetDisplay() {
            budgetDisplayDiv.textContent = `${t('budgetLabel')}: $${playerBudget.toFixed(2)}`;
        }
        updateBudgetDisplay();

        const canvasContainer = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
        camera.position.set(0, 1.6, 8);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        renderer.shadowMap.enabled = true;
        canvasContainer.appendChild(renderer.domElement);
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(20, 30, 15);
        dirLight.castShadow = true;
        scene.add(dirLight);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x969696 }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
        
        function createStall(x, z, canopyColor1, canopyColor2) {
            const stallGroup = new THREE.Group();
            const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
            const clothMaterial1 = new THREE.MeshStandardMaterial({ color: canopyColor1 });
            const clothMaterial2 = new THREE.MeshStandardMaterial({ color: canopyColor2 });
            const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3, 0.15, 1.5), woodMaterial);
            tableTop.position.y = 0.8;
            tableTop.castShadow = true;
            stallGroup.add(tableTop);
            const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
            const legPositions = [[-1.4, 0.4, -0.65], [1.4, 0.4, -0.65], [-1.4, 0.4, 0.65], [1.4, 0.4, 0.65]];
            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeo, woodMaterial);
                leg.position.set(...pos);
                stallGroup.add(leg);
            });
            const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
            const polePositions = [[-1.4, 1.25, -0.65], [1.4, 1.25, -0.65]];
            polePositions.forEach(pos => {
                const pole = new THREE.Mesh(poleGeo, woodMaterial);
                pole.position.set(...pos);
                stallGroup.add(pole);
            });
            const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.8), woodMaterial);
            for (let i = 0; i < 10; i++) {
                const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.2 / 10, 0.11, 1.8), i % 2 === 0 ? clothMaterial1 : clothMaterial2);
                stripe.position.set(-1.44 + i * 0.32, 0, 0);
                canopy.add(stripe);
            }
            canopy.position.set(0, 2.5, 0);
            canopy.rotation.z = -0.1;
            stallGroup.add(canopy);
            for (let i = 0; i < 10; i++) {
                const productGeo = Math.random() > 0.5 ? new THREE.BoxGeometry(0.2, 0.2, 0.3) : new THREE.SphereGeometry(0.1, 8, 8);
                const productMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) });
                const product = new THREE.Mesh(productGeo, productMat);
                product.position.set(Math.random() * 2 - 1, 0.95, Math.random() * 1 - 0.5);
                stallGroup.add(product);
            }
            stallGroup.position.set(x, 0, z);
            return stallGroup;
        }

        const vendors = [];
        const characterData = [
            { name: "Elena, la de las Verduras", pos: [-10, -5], wares: [{name: "Tomates", price: 0.65, unit: "pound"}, {name: "Cebolla", price: 0.25, unit: "each"}, {name: "Chile Verde", price: 0.20, unit: "each"}, {name: "Papas", price: 0.40, unit: "pound"}, {name: "Lechuga", price: 0.80, unit: "each"}, {name: "Pepino", price: 0.30, unit: "each"}, {name: "Zanahorias", price: 0.25, unit: "pound"}, {name: "Brócoli", price: 1.15, unit: "each"}, {name: "Ajo (cabeza)", price: 0.50, unit: "each"}, {name: "Cilantro (manojo)", price: 0.50, unit: "each"}], colors: [0x228b22, 0xffffff] },
            { name: "Marco, el de los Granos", pos: [10, -5], wares: [{name: "Frijoles", price: 1.19, unit: "pound"}, {name: "Arroz", price: 0.65, unit: "pound"}, {name: "Maíz", price: 0.40, unit: "pound"}, {name: "Azúcar", price: 0.50, unit: "pound"}, {name: "Sal", price: 0.25, unit: "pound"}, {name: "Café Molido", price: 4.75, unit: "pound"}, {name: "Avena", price: 1.50, unit: "pound"}, {name: "Lentejas", price: 0.90, unit: "pound"}, {name: "Harina de Trigo", price: 0.80, unit: "pound"}, {name: "Consomé de Pollo", price: 0.10, unit: "each"}], colors: [0xdaa520, 0xffffff] },
            { name: "Lira, la de los Lácteos", pos: [-10, 10], wares: [{name: "Queso Fresco", price: 2.49, unit: "pound"}, {name: "Queso Duro Blando", price: 3.00, unit: "pound"}, {name: "Crema Pura", price: 2.10, unit: "pound"}, {name: "Requesón", price: 1.50, unit: "pound"}, {name: "Leche (botella)", price: 1.25, unit: "each"}, {name: "Huevos (cartón)", price: 3.95, unit: "each"}, {name: "Mantequilla", price: 1.00, unit: "each"}, {name: "Yogurt Natural", price: 0.80, unit: "each"}, {name: "Cuajada", price: 1.75, unit: "pound"}, {name: "Quesillo", price: 3.50, unit: "pound"}], colors: [0x9932cc, 0x000000] },
            { name: "Bardo, el Carnicero", pos: [10, 10], wares: [{name: "Carne de Res", price: 4.89, unit: "pound"}, {name: "Pollo Entero", price: 5.25, unit: "each"}, {name: "Chuleta de Cerdo", price: 3.75, unit: "pound"}, {name: "Chorizos", price: 2.50, unit: "pound"}, {name: "Longaniza", price: 2.50, unit: "pound"}, {name: "Costilla de Res", price: 4.00, unit: "pound"}, {name: "Pechuga de Pollo", price: 2.85, unit: "pound"}, {name: "Carne Molida", price: 3.50, unit: "pound"}, {name: "Salchichas", price: 1.50, unit: "pound"}, {name: "Bistec de Res", price: 5.00, unit: "pound"}], colors: [0xDC143C, 0xffffff] },
            { name: "Gael, el Frutero", pos: [0, -10], wares: [{name: "Guineo", price: 0.12, unit: "each"}, {name: "Naranja", price: 0.15, unit: "each"}, {name: "Mango de Temporada", price: 0.50, unit: "each"}, {name: "Piña", price: 1.45, unit: "each"}, {name: "Sandía", price: 2.00, unit: "each"}, {name: "Papaya", price: 1.25, unit: "each"}, {name: "Melón", price: 1.75, unit: "each"}, {name: "Limones (5)", price: 0.50, unit: "each"}, {name: "Maracuyá (3)", price: 1.00, unit: "each"}, {name: "Aguacate", price: 1.10, unit: "each"}], colors: [0xff6347, 0xffffff] },
            { name: "Nia, la de los Dulces", pos: [0, 15], wares: [{name: "Conserva de Coco", price: 0.55, unit: "each"}, {name: "Dulce de Leche", price: 0.50, unit: "each"}, {name: "Alborotos", price: 0.25, unit: "each"}, {name: "Espumillas", price: 0.25, unit: "each"}, {name: "Tableta de Chocolate", price: 1.60, unit: "each"}, {name: "Galletas de Soda", price: 0.60, unit: "each"}, {name: "Refresco en Bolsa", price: 0.25, unit: "each"}, {name: "Churros", price: 0.50, unit: "each"}, {name: "Cocos Rallados", price: 1.00, unit: "each"}, {name: "Semita de Piña", price: 1.15, unit: "each"}], colors: [0xff69b4, 0xffffff] },
            { name: "Rocco, el Panadero", pos: [-15, 0], wares: [{name: "Pan Francés", price: 0.25, unit: "each"}, {name: "Pan Dulce Variado", price: 0.40, unit: "each"}, {name: "Torta de Yema", price: 2.00, unit: "each"}, {name: "Pichardines", price: 0.50, unit: "each"}, {name: "Salpores de Arroz", price: 0.40, unit: "each"}, {name: "Quesadilla (porción)", price: 1.30, unit: "each"}, {name: "Galletas de Avena", price: 0.75, unit: "each"}, {name: "Pan de Ajo", price: 1.50, unit: "each"}, {name: "Volteado de Piña", price: 1.50, unit: "each"}, {name: "Pastel de Chocolate", price: 1.85, unit: "each"}], colors: [0x808080, 0x000000] }
        ];

        characterData.forEach(data => {
            const charGroup = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6) }));
            charGroup.add(body);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffccaa }));
            head.position.y = 0.8;
            charGroup.add(head);
            charGroup.position.set(data.pos[0], 1, data.pos[1]);
            charGroup.userData = { ...data, isVendor: true, isCharacter: true, baseY: 1 };
            scene.add(charGroup);
            vendors.push(charGroup);
            const stall = createStall(data.pos[0], data.pos[1] - 2, new THREE.Color(data.colors[0]), new THREE.Color(data.colors[1]));
            scene.add(stall);
        });

        const shoppers = [];
        const shopperData = [
            { name: "Carlos", personality: "un ingeniero amigable y experto en fracciones y porcentajes. Le gusta aplicar las matemáticas a cosas prácticas como las compras.", pos: [5, 5] },
            { name: "Sofía", personality: "una profesora de matemáticas muy paciente y didáctica, cuya especialidad es la radicación y la potenciación. Disfruta explicando temas complejos de forma sencilla.", pos: [-5, 5] },
            { name: "Isabel", personality: "una contadora jubilada, muy cordial y detallista. Es una experta en funciones matemáticas y su aplicación en la vida real, como en las finanzas.", pos: [5, -5] },
            { name: "Mateo", personality: "un joven estudiante de negocios, enérgico y directo. Es un genio de la aritmética y el cálculo mental, y le gusta ser eficiente.", pos: [-5, -5] }
        ];

        shopperData.forEach(data => {
            const shopperGroup = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.1, 16), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5) }));
            shopperGroup.add(body);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), new THREE.MeshStandardMaterial({ color: 0xd2b48c }));
            head.position.y = 0.75;
            shopperGroup.add(head);
            shopperGroup.position.set(data.pos[0], 0.8, data.pos[1]);
            shopperGroup.userData = { 
                ...data, 
                isVendor: false, 
                isCharacter: true, 
                baseY: 0.8,
                state: 'WANDERING',
                targetPosition: new THREE.Vector3(),
                moveSpeed: 1.5 + Math.random() * 0.5,
                waitTime: 0,
            };
            scene.add(shopperGroup);
            shoppers.push(shopperGroup);
        });


        function generateShoppingList() {
            const allProducts = characterData.flatMap(vendor => vendor.wares);
            let list = [];
            let attempts = 0;
            const targetSize = Math.floor(Math.random() * 11) + 20;

            while (list.length < targetSize && attempts < 200) {
                const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
                if (!list.some(item => item.name === randomProduct.name)) {
                    let quantity = randomProduct.unit === 'pound' ? 
                        (Math.floor(Math.random() * 3) + 1) * 0.5 :
                        Math.floor(Math.random() * 3) + 1;
                    list.push({ name: randomProduct.name, quantity: quantity, unit: randomProduct.unit, purchased: false });
                }
                attempts++;
            }
            return list;
        }

        function renderShoppingList() {
            shoppingListItemsEl.innerHTML = '';
            shoppingList.forEach(item => {
                const li = document.createElement('li');
                const quantityText = item.unit === 'pound' ? item.quantity.toFixed(1) : item.quantity;
                li.textContent = `${item.name} (${quantityText} ${item.unit === 'pound' ? 'lbs' : 'unid.'})`;
                if (item.purchased) li.classList.add('purchased');
                shoppingListItemsEl.appendChild(li);
            });
        }
        
        toggleListBtn.addEventListener('click', () => {
            shoppingListModal.style.display = 'flex';
            document.exitPointerLock();
        });
        closeListBtn.addEventListener('click', () => {
            shoppingListModal.style.display = 'none';
            if (!currentCharacter) {
                renderer.domElement.requestPointerLock();
            }
        });

        function checkWinCondition() {
            if (shoppingList.every(item => item.purchased)) {
                const startOverlay = document.getElementById('start-overlay');
                startOverlay.innerHTML = `<h1>${t('winMessage')}</h1><h2>¡Buen trabajo, ${playerName}!</h2>`;
                startOverlay.style.display = 'flex';
                document.exitPointerLock();
            }
        }

        const dialogueBox = document.getElementById('dialogue-box');
        const dialogueName = document.getElementById('dialogue-name');
        const dialogueContent = document.getElementById('dialogue-content');
        const interactionPrompt = document.getElementById('interaction-prompt');
        const cartSummary = document.getElementById('cart-summary');
        const cartItemsDiv = document.getElementById('cart-items');
        const paymentOptionsDiv = document.getElementById('payment-options');

        let currentCharacter = null;
        let tempQuantities = {};
        let currentCart = {};
        
        async function callGemini(prompt, schema = null) {
            const apiKey = "AIzaSyDUft77jEIeTBaVkU97ME04PeXFysJQVEc";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            if (schema) {
                payload.generationConfig = {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                };
            }

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error(`API request failed: ${response.status}`);
                const result = await response.json();
                const text = result.candidates[0].content.parts[0].text;
                return schema ? JSON.parse(text) : text;
            } catch (error) {
                console.error("Error calling Gemini API:", error);
                return schema ? { action: "CHAT", response: "Lo siento, no te entendí bien." } : "Lo siento, ahora mismo no puedo hablar.";
            }
        }

        async function askQuestion() {
            const input = document.getElementById('interaction-input');
            const display = document.getElementById('interaction-display');
            const question = input.value.trim();
            if (!question) return;

            display.innerHTML += `<p class="user-msg">Tú: ${question}</p>`;
            input.value = '';
            display.scrollTop = display.scrollHeight;

            const thinkingMsg = document.createElement('p');
            thinkingMsg.className = 'vendor-msg';
            thinkingMsg.textContent = `${currentCharacter.userData.name.split(',')[0]}: ${t('thinking')}`;
            display.appendChild(thinkingMsg);
            display.scrollTop = display.scrollHeight;

            let prompt;
            let schema = null;

            if (currentCharacter.userData.isVendor) {
                const productListString = currentCharacter.userData.wares.map(w => w.name).join(', ');
                schema = {
                    type: "OBJECT",
                    properties: {
                        action: { type: "STRING", enum: ["ADD_TO_CART", "CONFIRM_ADD", "CHAT"] },
                        items: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: { productName: { type: "STRING" }, quantity: { type: "NUMBER" }, originalRequest: { type: "STRING" } }
                            }
                        },
                        response: { type: "STRING" }
                    },
                    required: ["action", "response"]
                };
                prompt = `Eres ${currentCharacter.userData.name}, un vendedor de mercado en El Salvador. Tus productos son: ${productListString}. El cliente ${playerName} dice: "${question}". Analiza su petición.
- Si pide un producto con cantidad numérica exacta (ej. '2 libras', '1.5 kg'), la acción es "ADD_TO_CART".
- Si pide cantidad no exacta (ej. 'media libra', 'un cuarto de kilo'), la acción es "CONFIRM_ADD".
- Si es una pregunta general, la acción es "CHAT".
- Extrae el nombre del producto, la cantidad numérica (convierte 'media' a 0.5, 'un cuarto' a 0.25), y la petición original. Da una respuesta amable y breve en español.`;
            } else {
                prompt = `Eres ${currentCharacter.userData.name}, un comprador en un mercado de El Salvador. Tu personalidad es la siguiente: "${currentCharacter.userData.personality}". Estás hablando con otro comprador llamado ${playerName}.
Instrucciones estrictas para tu respuesta:
1. Tu tono siempre debe ser cordial y amable.
2. Si el mensaje del usuario es un saludo simple como "hola", "buenos días", etc., DEBES responder presentándote con tu nombre y ofreciendo ayuda en tu especialidad matemática. Por ejemplo: "¡Hola! Soy Carlos. ¡Qué gusto! Aquí, viendo los precios. Por cierto, si necesitas ayuda con algo de fracciones, me dices."
3. Si el usuario te hace una pregunta sobre tu especialidad matemática, DEBES proporcionar una respuesta clara, correcta y útil. Explícalo como si estuvieras ayudando a un amigo en el mercado.
4. Si la pregunta no es sobre tu especialidad, responde de forma casual y breve como un comprador más.
El mensaje del usuario es: "${question}"`;
            }
            
            const result = await callGemini(prompt, schema);
            
            if (schema) { // Es un vendedor
                thinkingMsg.textContent = `${currentCharacter.userData.name.split(',')[0]}: ${result.response}`;
                if (result.action === 'ADD_TO_CART' && result.items) {
                    result.items.forEach(item => addItemToCart(item.productName, item.quantity));
                } else if (result.action === 'CONFIRM_ADD' && result.items && result.items.length > 0) {
                    const item = result.items[0];
                    const product = currentCharacter.userData.wares.find(w => w.name.toLowerCase() === item.productName.toLowerCase());
                    if (product) {
                        const confirmationDiv = document.createElement('div');
                        confirmationDiv.innerHTML = `<p>¿Quieres ${item.quantity} de ${item.productName}?</p>
                            <button id="confirm-yes">${t('confirm_add')}</button> <button id="confirm-no">${t('confirm_cancel')}</button>`;
                        display.appendChild(confirmationDiv);
                        document.getElementById('confirm-yes').onclick = () => {
                            addItemToCart(product.name, item.quantity);
                            confirmationDiv.innerHTML = `<p>¡Agregado!</p>`;
                        };
                        document.getElementById('confirm-no').onclick = () => { confirmationDiv.innerHTML = ``; };
                    }
                }
            } else { // Es un comprador
                thinkingMsg.textContent = `${currentCharacter.userData.name}: ${result}`;
            }
            display.scrollTop = display.scrollHeight;
        }

        function startDialogue(character) {
            currentCharacter = character;
            if (!character.userData.isVendor) {
                character.userData.state = 'INTERACTING_PLAYER';
            }
            
            dialogueBox.style.display = 'flex';
            dialogueName.textContent = character.userData.name;
            
            const dialogueContentDiv = document.getElementById('dialogue-content');
            const askButton = document.getElementById('ask-question-btn');
            const askInput = document.getElementById('interaction-input');

            if (character.userData.isVendor) {
                dialogueContentDiv.style.display = 'block';
                cartSummary.style.display = 'none';
                currentCart = {};
                tempQuantities = {};
                renderProductList();
            } else {
                dialogueContentDiv.style.display = 'none';
                cartSummary.style.display = 'none';
            }
            
            document.getElementById('interaction-display').innerHTML = '';
            askInput.placeholder = t('askPlaceholder');
            askButton.textContent = t('askButton');
            
            askButton.onclick = askQuestion;
            askInput.onkeydown = (e) => { if (e.key === 'Enter') askQuestion(); };

            updateCartDisplay();
        }

        function renderProductList() {
            let html = `<p>${t('todaysOffer')}</p><ul class="product-list">`;
            const cartTotal = calculateCartTotal();
            currentCharacter.userData.wares.forEach(ware => {
                const quantity = tempQuantities[ware.name] || 0;
                const increment = ware.unit === 'pound' ? 0.25 : 1;
                const canAfford = playerBudget >= (cartTotal + ware.price * increment);
                const displayQty = ware.unit === 'pound' ? quantity.toFixed(2) : quantity;
                // --- CORREGIDO: Usar traducción para la unidad ---
                html += `<li>
                    <div><div class="product-name">${ware.name}</div><div class="product-price">$${ware.price.toFixed(2)} / ${t('unit_' + ware.unit)}</div></div>
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="updateQuantity('${ware.name}', -1)">-</button>
                        <span class="quantity-display">${displayQty}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${ware.name}', 1)" ${canAfford ? '' : 'disabled'}>+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart('${ware.name}')" ${quantity > 0 ? '' : 'disabled'}>${t('addToCartButton')}</button>
                </li>`;
            });
            dialogueContent.innerHTML = html + `</ul>`;
        }

        window.updateQuantity = (name, change) => {
            let qty = tempQuantities[name] || 0;
            const item = currentCharacter.userData.wares.find(w => w.name === name);
            const increment = item.unit === 'pound' ? 0.25 : 1;
            const newQty = qty + (change * increment);
            if (newQty < 0) return;
            if (change > 0 && playerBudget < (calculateCartTotal() + item.price * increment)) return;
            tempQuantities[name] = newQty;
            renderProductList();
        };
        
        function addItemToCart(itemName, quantity) {
            const item = currentCharacter.userData.wares.find(w => w.name.toLowerCase() === itemName.toLowerCase());
            if (!item) return;
            const totalCost = item.price * quantity;
            if (playerBudget >= (calculateCartTotal() + totalCost)) {
                currentCart[item.name] = (currentCart[item.name] || 0) + quantity;
                updateCartDisplay();
                renderProductList();
            }
        }

        window.addToCart = (name) => {
            const quantity = tempQuantities[name];
            if (quantity > 0) {
                addItemToCart(name, quantity);
                tempQuantities[name] = 0;
                updateCartDisplay();
                renderProductList();
            }
        };

        function calculateCartTotal() {
            return Object.entries(currentCart).reduce((total, [name, qty]) => {
                const item = currentCharacter.userData.wares.find(w => w.name === name);
                return total + (item.price * qty);
            }, 0);
        }

        function handlePayment(total) {
            if (playerBudget >= total) {
                playerBudget -= total;
                updateBudgetDisplay();
                Object.entries(currentCart).forEach(([name, qty]) => {
                    const listItem = shoppingList.find(item => item.name === name);
                    if (listItem && !listItem.purchased && qty >= listItem.quantity) {
                        listItem.purchased = true;
                    }
                });
                renderShoppingList();
                checkWinCondition();
                closeDialogue();
            }
        }
        
        function generatePaymentOptions(total) {
            const options = [];
            const bills = [1, 5, 10, 20, 50, 100];
            options.push({ amount: total, isExact: true });
            let foundBills = 0;
            for (const bill of bills) {
                if (bill > total && foundBills < 2) {
                    options.push({ amount: bill, isExact: false });
                    foundBills++;
                }
            }
            return options.slice(0, 3);
        }

        function updateCartDisplay() {
            if (!currentCharacter || !currentCharacter.userData.isVendor) {
                cartSummary.style.display = 'none';
                return;
            }
            const total = calculateCartTotal();
            if (total > 0) {
                cartSummary.style.display = 'block';
                cartItemsDiv.innerHTML = Object.entries(currentCart).map(([name, qty]) => `<div>${qty.toFixed(2).replace(/\.00$/, '')} de ${name}</div>`).join('');
                paymentOptionsDiv.innerHTML = '';
                if (playerBudget >= total) {
                    const paymentOptions = generatePaymentOptions(total);
                    paymentOptions.forEach(option => {
                        const button = document.createElement('button');
                        button.className = 'payment-option-btn';
                        let buttonText = '';
                        if (option.isExact) {
                            buttonText = `${t('payButton')} ($${option.amount.toFixed(2)} ${t('exacto')})`;
                        } else {
                            const change = option.amount - total;
                            buttonText = `${t('payWith')} $${option.amount.toFixed(2)} (${t('change')}: $${change.toFixed(2)})`;
                        }
                        button.textContent = buttonText;
                        button.onclick = () => handlePayment(total);
                        paymentOptionsDiv.appendChild(button);
                    });
                }
            } else {
                cartSummary.style.display = 'none';
            }
        }

        function closeDialogue() {
            if (currentCharacter && !currentCharacter.userData.isVendor) {
                currentCharacter.userData.state = 'WANDERING';
            }
            dialogueBox.style.display = 'none';
            currentCharacter = null;
            renderer.domElement.requestPointerLock();
        }
        
        const keys = {};
        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            if (document.activeElement.id === 'interaction-input') return;

            if (e.code === 'KeyE' && !currentCharacter && shoppingListModal.style.display === 'none') {
                const allCharacters = [...vendors, ...shoppers];
                const nearby = allCharacters.find(c => camera.position.distanceTo(c.position) < 3.5);
                if (nearby) {
                    document.exitPointerLock();
                    startDialogue(nearby);
                }
            } else if (e.code === 'Escape') {
                if (currentCharacter) closeDialogue();
                else document.exitPointerLock();
            }
        });
        document.addEventListener('keyup', (e) => keys[e.code] = false);

        const clock = new THREE.Clock();
        let mouseX = 0;
        const playerVelocity = new THREE.Vector3();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const lookSpeed = 2.0;

            shoppers.forEach(shopper => {
                const data = shopper.userData;
                if (data.state === 'INTERACTING_PLAYER') {
                    shopper.lookAt(camera.position);
                    return;
                }

                if (data.state === 'INTERACTING') {
                    data.waitTime -= delta;
                    if (data.waitTime <= 0) {
                        data.state = 'WANDERING';
                    }
                } else { // WANDERING
                    const distanceToTarget = shopper.position.distanceTo(data.targetPosition);
                    if (distanceToTarget < 0.5) {
                        data.state = 'INTERACTING';
                        data.waitTime = Math.random() * 8 + 4;

                        if (Math.random() > 0.4) {
                            const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
                            data.targetPosition.set(
                                randomVendor.position.x + Math.random() * 2 - 1,
                                0.8,
                                randomVendor.position.z + 2 + Math.random()
                            );
                        } else {
                            data.targetPosition.set(
                                Math.random() * 30 - 15,
                                0.8,
                                Math.random() * 30 - 15
                            );
                        }
                    }

                    const moveDirection = new THREE.Vector3().subVectors(data.targetPosition, shopper.position).normalize();
                    shopper.position.add(moveDirection.multiplyScalar(data.moveSpeed * delta));
                    shopper.lookAt(data.targetPosition.x, 0.8, data.targetPosition.z);
                }
            });


            if (document.pointerLockElement === renderer.domElement) {
                playerVelocity.set(0, 0, 0);
                if (keys['KeyW']) playerVelocity.z = -1;
                if (keys['KeyS']) playerVelocity.z = 1;
                if (keys['KeyA']) playerVelocity.x = -1;
                if (keys['KeyD']) playerVelocity.x = 1;
                const moveVector = playerVelocity.clone().normalize().multiplyScalar(5.0 * delta);
                moveVector.applyAxisAngle(new THREE.Vector3(0,1,0), mouseX);
                camera.position.add(moveVector);

                if (keys['ArrowLeft']) mouseX += lookSpeed * delta;
                if (keys['ArrowRight']) mouseX -= lookSpeed * delta;
            }
            camera.rotation.y = mouseX;

            const allCharacters = [...vendors, ...shoppers];
            const nearby = allCharacters.find(c => camera.position.distanceTo(c.position) < 3.5);
            interactionPrompt.style.display = (nearby && !currentCharacter) ? 'block' : 'none';
            if(nearby) interactionPrompt.textContent = `${t('pressEToTalkTo')} ${nearby.userData.name.split(',')[0]}`;
            
            renderer.render(scene, camera);
        }
        
        window.addEventListener('resize', () => {
            camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === renderer.domElement) {
                mouseX -= e.movementX * 0.002;
            }
        });
        
        const startButton = document.getElementById('start-button');
        const startOverlay = document.getElementById('start-overlay');
        const playerNameInput = document.getElementById('player-name-input');

        startButton.addEventListener('click', () => {
            playerName = playerNameInput.value.trim() || "Aventurero/a";
            subtitleEl.textContent = `${t('welcomeMessage')} ${playerName}!`;
            shoppingList = generateShoppingList();
            renderShoppingList();
            startOverlay.style.display = 'none';
            renderer.domElement.requestPointerLock();
        });

        renderer.domElement.addEventListener('click', () => {
            if (document.pointerLockElement !== renderer.domElement) {
                renderer.domElement.requestPointerLock();
            }
        });
        
        animate();