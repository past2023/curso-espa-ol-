/* Contenido educativo centralizado. Se puede ampliar sin tocar el motor. */
window.GAME_DATA = {
  themes: [
    {id:'saludos',name:'Saludos',icon:'👋',words:[
      ['hola','привет','👋','Hola, me llamo Ana.'],['adiós','до свидания','🌅','Adiós, hasta mañana.'],['gracias','спасибо','💛','Gracias por tu ayuda.'],['por favor','пожалуйста','🙏','Agua, por favor.'],['me llamo','меня зовут','🙂','Me llamo Leo.'],['¿cómo estás?','как ты?','💬','Hola, ¿cómo estás?'] ]},
    {id:'numeros',name:'Números y colores',icon:'🔢',words:[
      ['uno','один','1️⃣','Tengo una llave.'],['dos','два','2️⃣','Veo dos árboles.'],['tres','три','3️⃣','Busca tres cristales.'],['rojo','красный','🔴','El amuleto es rojo.'],['azul','синий','🔵','El río es azul.'],['verde','зелёный','🟢','El bosque es verde.'] ]},
    {id:'familia',name:'Familia',icon:'👨‍👩‍👧',words:[
      ['madre','мама','👩','Mi madre se llama Elena.'],['padre','папа','👨','Mi padre es amable.'],['hermano','брат','👦','Tengo un hermano.'],['hermana','сестра','👧','Mi hermana lee.'],['abuela','бабушка','👵','Mi abuela cocina.'],['amigo','друг','🤝','Pablo es mi amigo.'] ]},
    {id:'comida',name:'Comida',icon:'🍎',words:[
      ['pan','хлеб','🍞','Como pan.'],['agua','вода','💧','Bebo agua.'],['manzana','яблоко','🍎','La manzana es roja.'],['leche','молоко','🥛','La leche es blanca.'],['queso','сыр','🧀','Me gusta el queso.'],['fuego','огонь','🔥','El fuego está caliente.'] ]},
    {id:'animales',name:'Animales',icon:'🐾',words:[['gato','кот','🐱','El gato duerme.'],['perro','собака','🐶','El perro corre.'],['pájaro','птица','🐦','El pájaro vuela.'],['pez','рыба','🐟','El pez nada.'],['caballo','лошадь','🐴','El caballo es grande.']]},
    {id:'ropa',name:'Ropa y cuerpo',icon:'👕',words:[['camisa','рубашка','👕','La camisa es azul.'],['zapatos','туфли','👟','Mis zapatos son nuevos.'],['cabeza','голова','🙂','Tengo una cabeza.'],['mano','рука','✋','Mi mano es pequeña.'],['ojos','глаза','👀','Mis ojos son verdes.']]},
    {id:'casa',name:'La casa',icon:'🏠',words:[['casa','дом','🏠','Mi casa es pequeña.'],['mesa','стол','🪑','El libro está en la mesa.'],['puerta','дверь','🚪','Abre la puerta.'],['cama','кровать','🛏️','La cama es cómoda.'],['ventana','окно','🪟','La ventana está abierta.']]},
    {id:'tiempo',name:'Tiempo',icon:'☀️',words:[['sol','солнце','☀️','Hoy hace sol.'],['lluvia','дождь','🌧️','La lluvia es fría.'],['lunes','понедельник','📅','Hoy es lunes.'],['hoy','сегодня','⌛','Hoy hace buen tiempo.'],['mañana','завтра / утро','🌄','Hasta mañana.']]},
    {id:'lugares',name:'Lugares',icon:'🧭',words:[['izquierda','налево','⬅️','Gira a la izquierda.'],['derecha','направо','➡️','La tienda está a la derecha.'],['arriba','вверх','⬆️','Mira arriba.'],['abajo','вниз','⬇️','Camina abajo.'],['tienda','магазин','🏪','Voy a la tienda.']]},
    {id:'verbos',name:'Verbos',icon:'⚡',words:[['ir','идти','🚶','Voy al castillo.'],['ver','видеть','👁️','Veo una luz.'],['hablar','говорить','💬','Hablo español.'],['abrir','открывать','🔓','Abre el libro.'],['ayudar','помогать','🤲','Ayudo a mi amigo.'],['luz','свет','✨','La luz vence a Olvido.']]}
  ],
  regions:[
    {id:0,name:'Pueblo Saludo',theme:'Saludos e introducciones',icon:'🏡',ground:'#77a85d',tile:'#80b567',edge:'#35583b',quest:'Habla con Don Diccionario',ru:'Поговори с Доном Словарём'},
    {id:1,name:'Bosque de los Números',theme:'Números y colores',icon:'🌲',ground:'#497b4c',tile:'#528b52',edge:'#213f32',quest:'Derrota 3 Sombras de Tinta',ru:'Победи 3 Чернильные Тени'},
    {id:2,name:'Aldea de la Familia',theme:'Familia y personas',icon:'🏘️',ground:'#b89c69',tile:'#c4aa76',edge:'#5e4c39',quest:'Derrota al Guardián Gris',ru:'Победи Серого Стража'},
    {id:3,name:'Valle de la Comida',theme:'Comida y bebidas',icon:'🍎',ground:'#8eb85e',tile:'#9bc76a',edge:'#46643a',quest:'Encuentra el fuego del horno',ru:'Найди огонь для печи'},
    {id:4,name:'Bosque Animal',theme:'Animales del bosque',icon:'🐾',ground:'#3f7652',tile:'#4b865c',edge:'#1d4437',quest:'Ayuda a los animales mágicos',ru:'Помоги волшебным животным'},
    {id:5,name:'Montaña de la Ropa',theme:'Ropa y partes del cuerpo',icon:'🏔️',ground:'#84969a',tile:'#94a8aa',edge:'#3d4e58',quest:'Sube a la torre del sastre',ru:'Поднимись к башне портного'},
    {id:6,name:'Ciudad Casa',theme:'La casa y sus objetos',icon:'🏰',ground:'#9d8b73',tile:'#ad9b82',edge:'#524a48',quest:'Abre la puerta encantada',ru:'Открой зачарованную дверь'},
    {id:7,name:'Isla del Tiempo',theme:'El tiempo y los días',icon:'🌦️',ground:'#69aa78',tile:'#76ba83',edge:'#286278',quest:'Devuelve el sol a la isla',ru:'Верни солнце на остров'},
    {id:8,name:'Laberinto de Direcciones',theme:'Lugares y direcciones',icon:'🧭',ground:'#88769d',tile:'#9885ac',edge:'#413955',quest:'Busca la puerta del castillo',ru:'Найди дверь в замок'}
  ],
  dialogues:{
    owl:[
      {speaker:'Don Diccionario',portrait:'🦉',text:'¡Hola, joven héroe! Me llamo Don Diccionario.',ru:'Привет, юный герой! Меня зовут Дон Словарь.',keys:['hola','me llamo']},
      {speaker:'Don Diccionario',portrait:'🦉',text:'¿Cómo estás? En Verbalia, cada palabra tiene magia.',ru:'Как ты? В Вербалии каждое слово обладает магией.',keys:['¿cómo estás?']},
      {speaker:'Don Diccionario',portrait:'🦉',text:'Busca palabras y ayuda al pueblo. ¡Gracias!',ru:'Ищи слова и помоги деревне. Спасибо!',keys:['gracias']}
    ],
    ana:[{speaker:'Ana',portrait:'A',text:'Hola, héroe. Necesito tres cristales: uno, dos y tres.',ru:'Привет, герой. Мне нужны три кристалла: один, два и три.',keys:['hola','uno','dos','tres']}],
    family:[{speaker:'Pablo',portrait:'P',text:'Mi madre, mi padre y mi hermana viven en esta aldea.',ru:'Мои мама, папа и сестра живут в этой деревне.',keys:['madre','padre','hermana']}],
    shop:[{speaker:'Señor Moneda',portrait:'M',text:'Hola, noble héroe. Mira mi tienda. Una poción, por favor.',ru:'Привет, благородный герой. Посмотри мой магазин. Одно зелье, пожалуйста.',keys:['hola','tienda','por favor']}],
    cook:[{speaker:'Doña Canela',portrait:'C',text:'Buen héroe, necesito pan, queso y una manzana roja.',ru:'Добрый герой, мне нужны хлеб, сыр и красное яблоко.',keys:['pan','queso','manzana','rojo']}],
    baker:[{speaker:'Maese Trigo',portrait:'T',text:'El fuego es magia. Con fuego preparo el pan del reino.',ru:'Огонь — это магия. С огнём я готовлю хлеб королевства.',keys:['fuego','pan']}],
    ranger:[{speaker:'Luna la Guardabosques',portrait:'L',text:'El gato mágico busca al perro y al pájaro del rey.',ru:'Волшебная кошка ищет собаку и королевскую птицу.',keys:['gato','perro','pájaro']}],
    druid:[{speaker:'Roble el Druida',portrait:'R',text:'El pez vive en el río. El caballo vive junto al bosque.',ru:'Рыба живёт в реке. Лошадь живёт у леса.',keys:['pez','caballo']}],
    tailor:[{speaker:'Maese Hilo',portrait:'H',text:'Tu camisa es buena, pero necesitas zapatos para la montaña.',ru:'Твоя рубашка хорошая, но для горы тебе нужна обувь.',keys:['camisa','zapatos']}],
    knight:[{speaker:'Dama Alba',portrait:'D',text:'Mira con tus ojos y protege tu cabeza y tu mano.',ru:'Смотри глазами и береги голову и руку.',keys:['ojos','cabeza','mano']}],
    architect:[{speaker:'Maese Piedra',portrait:'P',text:'La casa del mago tiene una puerta y una ventana azul.',ru:'В доме мага есть дверь и синее окно.',keys:['casa','puerta','ventana','azul']}],
    innkeeper:[{speaker:'Doña Cama',portrait:'C',text:'El libro está en la mesa. La cama está arriba.',ru:'Книга лежит на столе. Кровать находится наверху.',keys:['mesa','cama','arriba']}],
    seer:[{speaker:'Aurelia del Sol',portrait:'S',text:'Hoy es lunes. Hay sol, pero mañana llega la lluvia.',ru:'Сегодня понедельник. Светит солнце, но завтра будет дождь.',keys:['hoy','lunes','sol','mañana','lluvia']}],
    sailor:[{speaker:'Capitán Brisa',portrait:'B',text:'La isla está bajo la luz. Hoy hace buen tiempo.',ru:'Остров находится под светом. Сегодня хорошая погода.',keys:['luz','hoy']}],
    guide:[{speaker:'Sir Camino',portrait:'G',text:'Ve a la derecha, luego arriba. La tienda está a la izquierda.',ru:'Иди направо, затем наверх. Магазин находится слева.',keys:['derecha','arriba','tienda','izquierda']}],
    mage:[{speaker:'Merlín de las Palabras',portrait:'Ñ',text:'Para abrir el castillo debes hablar, ver y ayudar.',ru:'Чтобы открыть замок, нужно говорить, видеть и помогать.',keys:['abrir','hablar','ver','ayudar']}]
  },
  items:{potion:{name:'Poción de vida',ru:'Зелье здоровья',icon:'🧪',price:12},mana:{name:'Agua mágica',ru:'Волшебная вода',icon:'💧',price:10},sword:{name:'Espada brillante',ru:'Сияющий меч',icon:'🗡️',price:30},hint:{name:'Pista de palabra',ru:'Подсказка слова',icon:'🔍',price:15}}
};
// Normaliza las listas compactas a objetos con identificadores estables.
GAME_DATA.themes.forEach(theme=>theme.words=theme.words.map((w,i)=>({id:`${theme.id}_${i}`,es:w[0],ru:w[1],icon:w[2],example:w[3],theme:theme.id})));
GAME_DATA.words=GAME_DATA.themes.flatMap(t=>t.words);
