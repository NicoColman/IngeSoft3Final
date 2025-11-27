Feature('Aplicación');

After(async ({ I }) => {
  const deleteBtnSelector = locate('button').withText('Eliminar todo');

  // 1. Verificar si el botón es visible en la pantalla
  const visibleButtons = await I.grabNumberOfVisibleElements(deleteBtnSelector);

  if (visibleButtons > 0) {
    // 2. Verificar el atributo 'disabled'
    // Si el atributo NO existe (es null), el botón está habilitado.
    // Si devuelve 'true', '' o 'disabled', entonces no podemos clickear.
    const isDisabled = await I.grabAttributeFrom(deleteBtnSelector, 'disabled');

    if (isDisabled === null || isDisabled === false) {
        I.say('Limpiando base de datos...');
        I.click(deleteBtnSelector);
        try {
          I.acceptPopup();
        } catch (e) {
          // Ignoramos si no aparece el popup
        }
        I.wait(1);
    } else {
        I.say('El botón "Eliminar todo" está deshabilitado, no es necesario limpiar.');
    }
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