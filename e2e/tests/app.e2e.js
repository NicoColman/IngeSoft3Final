Feature('App');

Scenario('Agregar y eliminar item', async ({ I }) => {
  const itemName = 'Item de prueba ' + Date.now();

  I.amOnPage('/');

  I.wait(2);
  I.waitForText('Items', 30);

  // Agregar item
  I.fillField('Nuevo item', itemName);

  I.wait(1);
  I.click('Agregar');

  I.wait(3);

  // Verificar que el item existe
  I.waitForText(itemName, 30);

  // Eliminar item
  I.wait(2);
  I.click('Eliminar', locate('li').withText(itemName));

  // Verificar que el item desapareció
  I.wait(3);
  I.dontSee(itemName);
});

Scenario('Buscar y Ordenar items', async ({ I }) => {
  const uniqueId = Date.now();

  const itemA = 'Manzana ' + uniqueId;
  const itemB = 'Banana ' + uniqueId;
  const itemC = 'Naranja ' + uniqueId;

  I.amOnPage('/');
  I.waitForText('Items', 30);

  // Agregar items
  I.fillField('Nuevo item', itemA);
  I.click('Agregar');
  I.waitForText(itemA, 30);

  I.fillField('Nuevo item', itemB);
  I.click('Agregar');
  I.waitForText(itemB, 30);

  I.fillField('Nuevo item', itemC);
  I.click('Agregar');
  I.waitForText(itemC, 30);

  // Probar Búsqueda
  I.fillField('Buscar...', 'Manzana');
  I.wait(1);
  I.waitForText(itemA, 10);
  I.dontSee(itemB);
  I.dontSee(itemC);

  // Limpiar búsqueda
  I.fillField('Buscar...', '');
  I.wait(1);
  I.waitForText(itemB, 10);

  // Probar Ordenamiento (A-Z)
  I.selectOption('select', 'alphabetical'); 
  I.wait(1);
  
  // Verificamos que todos estén presentes
  I.waitForText(itemA, 10);
  I.waitForText(itemB, 10);
  I.waitForText(itemC, 10);

  I.click('Eliminar', locate('li').withText(itemA));
  I.click('Eliminar', locate('li').withText(itemB));
  I.click('Eliminar', locate('li').withText(itemC));
});

Scenario('Verificar contadores de items', async ({ I }) => {
  I.amOnPage('/');
  I.waitForText('Items', 30);

  // Verificar contador de caracteres
  I.fillField('Nuevo item', 'Hola');
  I.waitForText('4/100', 5);

  // Verificar contador de items
  const uniqueId = Date.now();
  const item = 'Item Contador ' + uniqueId;

  I.fillField('Nuevo item', item);
  I.click('Agregar');
  I.waitForText(item, 30);

  I.waitForText('items', 10);
  I.click('Eliminar', locate('li').withText(item));
});

Scenario('Verificar persistencia', async ({ I }) => {
  const uniqueId = Date.now();
  const item = 'Item Persistente ' + uniqueId;

  I.amOnPage('/');
  I.waitForText('Items', 30);

  I.fillField('Nuevo item', item);
  I.click('Agregar');
  I.waitForText(item, 30);

  // Recargar página
  I.refreshPage();
  I.waitForText('Items', 30);

  I.waitForText(item, 30);
  I.click('Eliminar', locate('li').withText(item));
});