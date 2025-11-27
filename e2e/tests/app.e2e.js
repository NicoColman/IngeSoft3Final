Feature('App');

Scenario('Agregar y eliminar item', async ({ I }) => {
  const itemName = 'Item de prueba ' + Date.now();

  I.amOnPage('/');
  I.wait(2);
  I.waitForText('Items', 30);

  I.fillField('Nuevo item', itemName);
  I.wait(1);
  I.click('Agregar');
  I.wait(3);

  I.waitForText(itemName, 30);

  I.wait(2);
  I.click('Eliminar', locate('li').withText(itemName));

  I.waitForInvisible(locate('li').withText(itemName), 10);
});

Scenario('Buscar y Ordenar items', async ({ I }) => {
  const uniqueId = Date.now();

  const itemA = 'Manzana ' + uniqueId;
  const itemB = 'Banana ' + uniqueId;
  const itemC = 'Naranja ' + uniqueId;

  I.amOnPage('/');
  I.waitForText('Items', 30);

  I.fillField('Nuevo item', itemA);
  I.click('Agregar');
  I.waitForText(itemA, 10); 

  I.fillField('Nuevo item', itemB);
  I.click('Agregar');
  I.waitForText(itemB, 10);

  I.fillField('Nuevo item', itemC);
  I.click('Agregar');
  I.waitForText(itemC, 10);

  I.fillField('Buscar...', 'Manzana');
  I.wait(1);
  I.waitForText(itemA, 10);
  I.dontSee(itemB);
  I.dontSee(itemC);

  I.fillField('Buscar...', '');
  I.wait(1);
  I.waitForText(itemB, 10);

  I.selectOption('select', 'alphabetical'); 
  I.wait(1);
  
  I.waitForText(itemA, 10);
  I.waitForText(itemB, 10);
  I.waitForText(itemC, 10);

  I.click('Eliminar', locate('li').withText(itemA));
  I.waitForInvisible(locate('li').withText(itemA), 5); 

  I.click('Eliminar', locate('li').withText(itemB));
  I.waitForInvisible(locate('li').withText(itemB), 5); 

  I.click('Eliminar', locate('li').withText(itemC));
  I.waitForInvisible(locate('li').withText(itemC), 5);
});

Scenario('Verificar contadores de items', async ({ I }) => {
  I.amOnPage('/');
  I.waitForText('Items', 30);

  I.fillField('Nuevo item', 'Hola');
  I.waitForText('4/100', 5);

  const uniqueId = Date.now();
  const item = 'Item Contador ' + uniqueId;

  I.fillField('Nuevo item', item);
  I.click('Agregar');
  I.waitForText(item, 30);

  I.waitForText('items', 10);
  
  I.wait(1); 
  I.click('Eliminar', locate('li').withText(item));
  
  I.waitForInvisible(locate('li').withText(item), 10);
});

Scenario('Verificar persistencia', async ({ I }) => {
  const uniqueId = Date.now();
  const item = 'Item Persistente ' + uniqueId;

  I.amOnPage('/');
  I.waitForText('Items', 30);

  I.fillField('Nuevo item', item);
  I.click('Agregar');
  I.waitForText(item, 30);

  I.refreshPage();
  I.waitForText('Items', 30);

  I.waitForText(item, 30);
  
  I.wait(1); 
  I.click('Eliminar', locate('li').withText(item));
  I.waitForInvisible(locate('li').withText(item), 10);
});