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
    {id:2,name:'Aldea de la Familia',theme:'Familia y personas',icon:'🏘️',ground:'#b89c69',tile:'#c4aa76',edge:'#5e4c39',quest:'Derrota al Guardián Gris',ru:'Победи Серого Стража'}
  ],
  dialogues:{
    owl:[
      {speaker:'Don Diccionario',portrait:'🦉',text:'¡Hola, joven héroe! Me llamo Don Diccionario.',ru:'Привет, юный герой! Меня зовут Дон Словарь.',keys:['hola','me llamo']},
      {speaker:'Don Diccionario',portrait:'🦉',text:'¿Cómo estás? En Verbalia, cada palabra tiene magia.',ru:'Как ты? В Вербалии каждое слово обладает магией.',keys:['¿cómo estás?']},
      {speaker:'Don Diccionario',portrait:'🦉',text:'Busca palabras y ayuda al pueblo. ¡Gracias!',ru:'Ищи слова и помоги деревне. Спасибо!',keys:['gracias']}
    ],
    ana:[{speaker:'Ana',portrait:'👩',text:'¡Hola! Necesito tres cristales. Uno, dos, tres.',ru:'Привет! Мне нужны три кристалла. Один, два, три.',keys:['hola','uno','dos','tres']}],
    family:[{speaker:'Pablo',portrait:'👦',text:'Mi madre, mi padre y mi hermana viven aquí.',ru:'Мои мама, папа и сестра живут здесь.',keys:['madre','padre','hermana']}],
    shop:[{speaker:'Señor Moneda',portrait:'🧔',text:'¡Hola! Mira mi tienda. Compra una poción, por favor.',ru:'Привет! Посмотри мой магазин. Купи зелье, пожалуйста.',keys:['hola','tienda','por favor']}]
  },
  items:{potion:{name:'Poción de vida',ru:'Зелье здоровья',icon:'🧪',price:12},mana:{name:'Agua mágica',ru:'Волшебная вода',icon:'💧',price:10},sword:{name:'Espada brillante',ru:'Сияющий меч',icon:'🗡️',price:30},hint:{name:'Pista de palabra',ru:'Подсказка слова',icon:'🔍',price:15}}
};
// Normaliza las listas compactas a objetos con identificadores estables.
GAME_DATA.themes.forEach(theme=>theme.words=theme.words.map((w,i)=>({id:`${theme.id}_${i}`,es:w[0],ru:w[1],icon:w[2],example:w[3],theme:theme.id})));
GAME_DATA.words=GAME_DATA.themes.flatMap(t=>t.words);
