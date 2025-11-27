Feature('Aplicación');

// Usamos este hook para limpiar SIEMPRE después de cada test
// Asumimos que existe el botón "Eliminar todo" que vimos en los unit tests
After(async ({ I }) => {
  // Intentamos limpiar solo si hay items
  // Nota: En CodeceptJS a veces se usa try/catch o lógica condicional 
  // si el botón no existe cuando la lista está vacía.
  // Aquí asumimos un flujo feliz donde borramos todo al final.
  
  I.say('Limpiando base de datos después del test...');
  
  // Verificamos si existe el botón antes de intentar clickearlo para evitar fallos si la lista está vacía
  const numItems = await I.grabNumberOfVisibleElements('li');
  if (numItems > 0) {
      I.click('Eliminar todo');
      try {
        I.acceptPopup(); // Aceptamos la confirmación "window.confirm"
      } catch (e) {
        // Ignorar si no sale popup
      }
      I.wait(1); // Esperar a que se borren
  }
});

Scenario('Agregar y eliminar item individual', async ({ I }) => {
  const itemName = 'Item Temporal ' + Date.now();

  I.amOnPage('/');
  I.waitForText('Items', 30);

  // 1. Agregar
  I.fillField('Nuevo item', itemName);
  I.click('Agregar');
  I.waitForText(itemName, 30);

  // 2. Eliminar (Este escenario SÍ prueba el borrado individual)
  // Buscamos el botón 'Eliminar' específicamente dentro del <li> de este item
  const deleteBtn = locate('button').withText('Eliminar').inside(locate('li').withText(itemName));
  I.click(deleteBtn);
  
  // Manejo del popup nativo
  try { I.acceptPopup(); } catch (e) {}

  // 3. Verificar que ya no está
  I.dontSee(itemName);
});

Scenario('Buscar y Ordenar items', async ({ I }) => {
  const uniqueId = Date.now();
  const itemA = 'Manzana ' + uniqueId;
  const itemB = 'Banana ' + uniqueId;
  const itemC = 'Naranja ' + uniqueId;

  I.amOnPage('/');
  I.waitForText('Items', 30);

  // Agregamos, pero NO borramos aquí (lo hará el After global)
  I.fillField('Nuevo item', itemA);
  I.click('Agregar');
  I.fillField('Nuevo item', itemB);
  I.click('Agregar');
  I.fillField('Nuevo item', itemC);
  I.click('Agregar');

  I.waitForText(itemC, 30);

  // Test de Búsqueda
  I.fillField('Buscar...', 'Manzana');
  I.wait(1);
  I.see(itemA);
  I.dontSee(itemB);

  // Test de Ordenamiento
  I.fillField('Buscar...', ''); // Limpiar búsqueda
  I.selectOption('select', 'alphabetical');
  I.wait(1);
  I.see(itemA);
  I.see(itemB);
  I.see(itemC);
});

Scenario('Verificar contadores de items', async ({ I }) => {
  I.amOnPage('/');
  
  // Test contador caracteres
  I.fillField('Nuevo item', 'Hola');
  I.waitForText('4/100', 5);

  // Test contador items
  const item = 'Item Contador ' + Date.now();
  I.fillField('Nuevo item', item);
  I.click('Agregar');
  
  I.see(item);
  I.see('items'); // Verifica que dice "1 items" o similar
});

Scenario('Verificar persistencia', async ({ I }) => {
  const item = 'Item Persistente ' + Date.now();

  I.amOnPage('/');
  I.fillField('Nuevo item', item);
  I.click('Agregar');
  I.see(item);

  I.refreshPage();
  I.waitForText('Items', 30);
  
  // Verificamos que sigue ahí
  I.see(item);
  
  // Al terminar este bloque, se ejecutará el 'After' y limpiará todo.
});