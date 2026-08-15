/* Contenido educativo centralizado. Se puede ampliar sin tocar el motor. */
window.GAME_DATA = {
  themes: [
    {id:'saludos',name:'Saludos',icon:'👋',words:[
      ['hola','привет','👋','Hola, me llamo Ana.'],['adiós','до свидания','🌅','Adiós, hasta mañana.'],['gracias','спасибо','💛','Gracias por tu ayuda.'],['por favor','пожалуйста','🙏','Agua, por favor.'],['me llamo','меня зовут','🙂','Me llamo Leo.'],['¿cómo estás?','как дела?','💬','Hola, ¿cómo estás?'] ]},
    {id:'numeros',name:'Números y colores',icon:'🔢',words:[
      ['uno','один','1️⃣','Uno más uno son dos.'],['dos','два','2️⃣','Veo dos árboles.'],['tres','три','3️⃣','Busca tres cristales.'],['rojo','красный','🔴','El amuleto es rojo.'],['azul','синий','🔵','El río es azul.'],['verde','зелёный','🟢','El bosque es verde.'] ]},
    {id:'familia',name:'Familia',icon:'👨‍👩‍👧',words:[
      ['madre','мама','👩','Mi madre se llama Elena.'],['padre','папа','👨','Mi padre es amable.'],['hermano','брат','👦','Tengo un hermano.'],['hermana','сестра','👧','Mi hermana lee.'],['abuela','бабушка','👵','Mi abuela cocina.'],['amigo','друг','🤝','Pablo es mi amigo.'] ]},
    {id:'comida',name:'Comida',icon:'🍎',words:[
      ['pan','хлеб','🍞','Como pan.'],['agua','вода','💧','Bebo agua.'],['manzana','яблоко','🍎','La manzana es roja.'],['leche','молоко','🥛','La leche es blanca.'],['queso','сыр','🧀','Me gusta el queso.'],['fuego','огонь','🔥','El fuego da calor.'] ]},
    {id:'animales',name:'Animales',icon:'🐾',words:[['gato','кот','🐱','El gato duerme.'],['perro','собака','🐶','El perro corre.'],['pájaro','птица','🐦','El pájaro vuela.'],['pez','рыба','🐟','El pez nada.'],['caballo','лошадь','🐴','El caballo es grande.']]},
    {id:'ropa',name:'Ropa y cuerpo',icon:'👕',words:[['camisa','рубашка','👕','La camisa es azul.'],['zapatos','туфли','👟','Mis zapatos son nuevos.'],['cabeza','голова','🙂','Me duele la cabeza.'],['mano','рука','✋','Mi mano es pequeña.'],['ojos','глаза','👀','Mis ojos son verdes.']]},
    {id:'casa',name:'La casa',icon:'🏠',words:[['casa','дом','🏠','Mi casa es pequeña.'],['mesa','стол','🪑','El libro está en la mesa.'],['puerta','дверь','🚪','Abre la puerta.'],['cama','кровать','🛏️','La cama es cómoda.'],['ventana','окно','🪟','La ventana está abierta.']]},
    {id:'tiempo',name:'Tiempo',icon:'☀️',words:[['sol','солнце','☀️','Hoy hace sol.'],['lluvia','дождь','🌧️','Hoy hay lluvia.'],['lunes','понедельник','📅','Hoy es lunes.'],['hoy','сегодня','⌛','Hoy hace buen tiempo.'],['mañana','завтра; утро','🌄','Hasta mañana.']]},
    {id:'lugares',name:'Lugares',icon:'🧭',words:[['izquierda','слева; налево','⬅️','Gira a la izquierda.'],['derecha','справа; направо','➡️','La tienda está a la derecha.'],['arriba','наверху; вверх','⬆️','Mira arriba.'],['abajo','внизу; вниз','⬇️','El gato está abajo.'],['tienda','магазин','🏪','Voy a la tienda.']]},
    {id:'verbos',name:'Verbos',icon:'⚡',words:[['ir','идти','🚶','Voy al castillo.'],['ver','видеть','👁️','Veo una luz.'],['hablar','говорить','💬','Hablo español.'],['abrir','открывать','🔓','Abre el libro.'],['ayudar','помогать','🤲','Ayudo a mi amigo.'],['luz','свет','✨','La luz vence a Olvido.']]},
    {id:'emociones',name:'Emociones',icon:'💛',words:[['feliz','счастливый','😊','Hoy estoy feliz.'],['triste','грустный','😢','El rey está triste.'],['miedo','страх','😨','No tengo miedo.'],['calma','спокойствие','🕊️','Siento calma en el jardín.'],['amable','добрый','🙂','La maga es amable.'],['valiente','храбрый','🛡️','Ana es valiente.']]},
    {id:'aventura',name:'La aventura',icon:'🔮',words:[['libro','книга','📕','El libro tiene magia.'],['palabra','слово','💬','Cada palabra tiene poder.'],['cristal','кристалл','💎','El cristal brilla.'],['reino','королевство','🏰','Verbalia es un reino mágico.'],['héroe','герой','⚔️','El héroe ayuda al reino.'],['victoria','победа','🏆','La victoria está cerca.']]}
  ],
  regions:[
    {id:0,name:'Pueblo de los Saludos',theme:'Saludos e introducciones',icon:'🏡',ground:'#77a85d',tile:'#80b567',edge:'#35583b',quest:'Habla con Don Diccionario',ru:'Поговори с Доном Словарём'},
    {id:1,name:'Bosque de los Números',theme:'Números y colores',icon:'🌲',ground:'#497b4c',tile:'#528b52',edge:'#213f32',quest:'Derrota 3 Sombras de Tinta',ru:'Победи 3 Чернильные Тени'},
    {id:2,name:'Aldea de la Familia',theme:'Familia y personas',icon:'🏘️',ground:'#b89c69',tile:'#c4aa76',edge:'#5e4c39',quest:'Derrota al Guardián Gris',ru:'Победи Серого Стража'},
    {id:3,name:'Valle de la Comida',theme:'Comida y bebidas',icon:'🍎',ground:'#8eb85e',tile:'#9bc76a',edge:'#46643a',quest:'Derrota al Caballero del Horno',ru:'Победи Рыцаря Печи'},
    {id:4,name:'Bosque de los Animales',theme:'Animales del bosque',icon:'🐾',ground:'#3f7652',tile:'#4b865c',edge:'#1d4437',quest:'Derrota al Rey de las Bestias',ru:'Победи Короля Зверей'},
    {id:5,name:'Montaña de la Ropa',theme:'Ropa y partes del cuerpo',icon:'🏔️',ground:'#84969a',tile:'#94a8aa',edge:'#3d4e58',quest:'Derrota al Gigante de Hielo',ru:'Победи Ледяного Великана'},
    {id:6,name:'Ciudad de las Casas',theme:'La casa y sus objetos',icon:'🏰',ground:'#9d8b73',tile:'#ad9b82',edge:'#524a48',quest:'Derrota al Señor de la Torre',ru:'Победи Владыку Башни'},
    {id:7,name:'Isla del Tiempo',theme:'El tiempo y los días',icon:'🌦️',ground:'#69aa78',tile:'#76ba83',edge:'#286278',quest:'Derrota al Rey de la Tormenta',ru:'Победи Короля Бури'},
    {id:8,name:'Laberinto de Direcciones',theme:'Lugares y direcciones',icon:'🧭',ground:'#88769d',tile:'#9885ac',edge:'#413955',quest:'Derrota al Minotauro de las Palabras',ru:'Победи Минотавра Слов'},
    {id:9,name:'Fortaleza de los Verbos',theme:'Acciones y magia',icon:'⚔️',ground:'#665b72',tile:'#776880',edge:'#30293e',quest:'Derrota al Caballero del Silencio',ru:'Победи Рыцаря Молчания'},
    {id:10,name:'Jardín de las Emociones',theme:'Emociones y cualidades',icon:'🌸',ground:'#65966b',tile:'#74a778',edge:'#315641',quest:'Devuelve la calma al Guardián Triste',ru:'Верни спокойствие Грустному Стражу'},
    {id:11,name:'Biblioteca de Cristal',theme:'Repaso de la aventura',icon:'🔮',ground:'#53658a',tile:'#62749a',edge:'#292f50',quest:'Derrota a Olvido y salva Verbalia',ru:'Победи Ольвидо и спаси Вербалию'}
  ],
  dialogues:{
    owl:[
      {speaker:'Don Diccionario',portrait:'🦉',text:'¡Hola, joven héroe! Me llamo Don Diccionario.',ru:'Привет, юный герой! Меня зовут Дон Словарь.',keys:['hola','me llamo']},
      {speaker:'Don Diccionario',portrait:'🦉',text:'¿Cómo estás? En Verbalia, cada palabra tiene magia.',ru:'Как ты? В Вербалии каждое слово обладает магией.',keys:['¿cómo estás?']},
      {speaker:'Don Diccionario',portrait:'🦉',text:'Busca palabras y ayuda al pueblo. ¡Gracias!',ru:'Ищи слова и помоги деревне. Спасибо!',keys:['gracias']}
    ],
    ana:[{speaker:'Ana',portrait:'A',text:'Hola, héroe. Cuenta conmigo: uno, dos y tres. Derrota a tres Sombras de Tinta.',ru:'Привет, герой. Считай со мной: один, два и три. Победи трёх Чернильных Теней.',keys:['hola','uno','dos','tres']}],
    anaBrave:[{speaker:'Ana la Valiente',portrait:'A',text:'Hola de nuevo, héroe. Uno, dos y tres: juntos protegemos la aldea.',ru:'Снова привет, герой. Один, два и три: вместе мы защищаем деревню.',keys:['hola','uno','dos','tres']}],
    family:[{speaker:'Pablo',portrait:'P',text:'Mi madre, mi padre y mi hermana viven en esta aldea.',ru:'Мои мама, папа и сестра живут в этой деревне.',keys:['madre','padre','hermana']}],
    shop:[{speaker:'Señor Moneda',portrait:'M',text:'Hola, noble héroe. Mira mi tienda, por favor. Tengo pociones.',ru:'Привет, благородный герой. Посмотри, пожалуйста, мой магазин. У меня есть зелья.',keys:['hola','tienda','por favor']}],
    cook:[{speaker:'Doña Canela',portrait:'C',text:'Valiente héroe, necesito pan, queso y una manzana de color rojo.',ru:'Храбрый герой, мне нужны хлеб, сыр и красное яблоко.',keys:['pan','queso','manzana','rojo']}],
    baker:[{speaker:'Maese Trigo',portrait:'T',text:'Con el fuego preparo el pan. El Caballero del Horno teme el agua.',ru:'На огне я готовлю хлеб. Рыцарь Печи боится воды.',keys:['fuego','pan','agua']}],
    ranger:[{speaker:'Luna la Guardabosques',portrait:'L',text:'El gato mágico busca al perro y al pájaro del rey.',ru:'Волшебный кот ищет собаку и птицу короля.',keys:['gato','perro','pájaro']}],
    druid:[{speaker:'Roble el Druida',portrait:'R',text:'El pez vive en el río. El caballo vive cerca del bosque. El Rey de las Bestias teme el fuego.',ru:'Рыба живёт в реке. Лошадь живёт рядом с лесом. Король Зверей боится огня.',keys:['pez','caballo','fuego']}],
    tailor:[{speaker:'Maese Hilo',portrait:'H',text:'Tu camisa es bonita, pero necesitas zapatos para subir a la montaña.',ru:'Твоя рубашка красивая, но для подъёма на гору тебе нужна обувь.',keys:['camisa','zapatos']}],
    knight:[{speaker:'Dama Alba',portrait:'D',text:'Abre bien los ojos. Protege la cabeza y la mano. El Gigante de Hielo teme el fuego.',ru:'Широко открой глаза. Береги голову и руку. Ледяной Великан боится огня.',keys:['ojos','cabeza','mano','fuego']}],
    architect:[{speaker:'Maese Piedra',portrait:'P',text:'La casa del mago tiene una puerta y una ventana azul.',ru:'В доме мага есть дверь и синее окно.',keys:['casa','puerta','ventana','azul']}],
    innkeeper:[{speaker:'Doña Cama',portrait:'C',text:'El libro está en la mesa y la cama está arriba. La palabra abrir vence al Señor de la Torre.',ru:'Книга лежит на столе, а кровать находится наверху. Слово «открывать» побеждает Владыку Башни.',keys:['mesa','cama','arriba','abrir']}],
    seer:[{speaker:'Aurelia del Sol',portrait:'S',text:'Hoy es lunes. Hay sol, pero mañana llega la lluvia.',ru:'Сегодня понедельник. Светит солнце, но завтра будет дождь.',keys:['hoy','lunes','sol','mañana','lluvia']}],
    sailor:[{speaker:'Capitán Brisa',portrait:'B',text:'Hoy la isla necesita la luz del sol. El Rey de la Tormenta teme el sol.',ru:'Сегодня острову нужен солнечный свет. Король Бури боится солнца.',keys:['hoy','luz','sol']}],
    guide:[{speaker:'Sir Camino',portrait:'G',text:'El Minotauro protege la torre de la derecha. La tienda está abajo, a la izquierda.',ru:'Минотавр охраняет башню справа. Магазин находится внизу слева.',keys:['derecha','tienda','abajo','izquierda']}],
    mage:[{speaker:'Merlín de las Palabras',portrait:'Ñ',text:'Debes hablar conmigo, héroe. El Minotauro teme la palabra arriba. Usa también la luz.',ru:'Ты должен поговорить со мной, герой. Минотавр боится слова «arriba». Используй также свет.',keys:['hablar','arriba','luz']}],
    shopForest:[{speaker:'Mercader Real',portrait:'R',text:'Mi tienda está junto al camino. Compra una poción antes de entrar en el bosque.',ru:'Мой магазин находится рядом с дорогой. Купи зелье перед входом в лес.',keys:['tienda']}],
    shopFood:[{speaker:'Mercader Azafrán',portrait:'A',text:'Mi tienda está junto al mercado. Tengo agua y pociones para el horno.',ru:'Мой магазин находится рядом с рынком. У меня есть вода и зелья для печи.',keys:['tienda','agua']}],
    shopMountain:[{speaker:'Armera Nieve',portrait:'N',text:'Mi tienda está en la montaña. Compra una poción antes de luchar con el gigante.',ru:'Мой магазин находится в горах. Купи зелье перед битвой с великаном.',keys:['tienda']}],
    shopCity:[{speaker:'Mercader Llave',portrait:'L',text:'Esta tienda está cerca de la casa grande. Mejora tu espada para entrar en la torre.',ru:'Этот магазин находится рядом с большим домом. Улучши меч, чтобы войти в башню.',keys:['tienda','casa']}],
    shopMaze:[{speaker:'Mercader Brújula',portrait:'B',text:'Mi tienda está abajo, a la izquierda. Prepárate antes de luchar con el Minotauro.',ru:'Мой магазин находится внизу слева. Подготовься перед битвой с Минотавром.',keys:['tienda','abajo','izquierda']}],
    captain:[{speaker:'Capitana Verbo',portrait:'V',text:'Debes hablar para romper el silencio. El caballero teme la palabra hablar.',ru:'Ты должен говорить, чтобы разрушить тишину. Рыцарь боится слова «hablar».',keys:['hablar']}],
    scribe:[{speaker:'Escriba Real',portrait:'E',text:'Para abrir la puerta, debes ver la señal y ayudar al guardián.',ru:'Чтобы открыть дверь, нужно увидеть знак и помочь стражу.',keys:['abrir','ver','ayudar']}],
    shopFortress:[{speaker:'Herrero Verbo',portrait:'H',text:'Mi tienda está junto a la fortaleza. Mejora tu espada antes de ir al patio.',ru:'Мой магазин находится рядом с крепостью. Улучши меч перед выходом во двор.',keys:['tienda','ir']}],
    gardener:[{speaker:'Flora del Jardín',portrait:'F',text:'El guardián está triste. Usa la palabra calma y será feliz.',ru:'Страж грустит. Используй слово «calma», и он станет счастливым.',keys:['triste','calma','feliz']}],
    brave:[{speaker:'Leo el Valiente',portrait:'L',text:'No tengo miedo. Un héroe valiente ayuda a sus amigos.',ru:'Я не боюсь. Храбрый герой помогает своим друзьям.',keys:['miedo','héroe','valiente']}],
    crystalKeeper:[{speaker:'Guardián de Cristal',portrait:'C',text:'El cristal guarda cada palabra del reino. La luz puede vencer a Olvido.',ru:'Кристалл хранит каждое слово королевства. Свет может победить Ольвидо.',keys:['cristal','palabra','reino','luz']}],
    scholar:[{speaker:'Sabia Memoria',portrait:'S',text:'Abre el libro, héroe. Tu victoria está cerca.',ru:'Открой книгу, герой. Твоя победа близка.',keys:['libro','héroe','victoria']}],
    shopCrystal:[{speaker:'Mercader de Cristal',portrait:'C',text:'Esta tienda es la última. Compra lo necesario antes de luchar con Olvido.',ru:'Это последний магазин. Купи всё необходимое перед битвой с Ольвидо.',keys:['tienda']}]
  },
  items:{
    potion:{name:'Poción de vida',ru:'Зелье здоровья',icon:'🧪',price:12,desc:'Recupera 45 puntos de vida.',descRu:'Восстанавливает 45 единиц здоровья.'},
    mana:{name:'Agua mágica',ru:'Волшебная вода',icon:'💧',price:10,desc:'Recupera 35 puntos de maná.',descRu:'Восстанавливает 35 единиц маны.'},
    sword:{name:'Espada brillante',ru:'Сияющий меч',icon:'🗡️',price:30,desc:'Aumenta el daño de tu espada.',descRu:'Увеличивает урон меча.'},
    hint:{name:'Pista de palabra',ru:'Подсказка для слова',icon:'🔍',price:15,desc:'Descubre una palabra desconocida.',descRu:'Открывает одно неизвестное слово.'}
  }
};
// Normaliza las listas compactas a objetos con identificadores estables.
GAME_DATA.themes.forEach(theme=>theme.words=theme.words.map((w,i)=>({id:`${theme.id}_${i}`,es:w[0],ru:w[1],icon:w[2],example:w[3],theme:theme.id})));
GAME_DATA.words=GAME_DATA.themes.flatMap(t=>t.words);
