// Local place names are transliterated; this does not certify ancient/modern
// correspondence or the coordinates inherited from the original catalogue.
export const placeEnglish: Record<string, {
  historicalName: string; modernName: string; modernAdministrativeUnit: string; notes: string; aliases: string[];
}> = {
  erlitou:{historicalName:'Erlitou',aliases:['Zhenxun (scholarly interpretation)'],modernName:'Near Erlitou village',modernAdministrativeUnit:'Yanshi District, Luoyang, Henan',notes:'Approximate cultural-core reference; not a Xia state border.'},
  wan_nanyang:{historicalName:'Wan',aliases:['Wancheng'],modernName:'Urban Nanyang',modernAdministrativeUnit:'Nanyang, Henan',notes:'Approximate location of an early Gengshi political centre.'},
  xianyang: {historicalName:'Xianyang',modernName:'Xianyang',modernAdministrativeUnit:'Shaanxi',notes:'Qin capital.',aliases:['Xianyang Palace']},
  changan: {historicalName:'Chang’an',modernName:'Xi’an',modernAdministrativeUnit:'Shaanxi',notes:'An important capital of Han, Sui and Tang.',aliases:["Chang'an","Xi'an",'Xijing']},
  luoyang: {historicalName:'Luoyang',modernName:'Luoyang',modernAdministrativeUnit:'Henan',notes:'Capital of Eastern Han, Wei, Jin and several northern governments.',aliases:['Luoyang']},
  ye: {historicalName:'Ye',modernName:'Around Linzhang County',modernAdministrativeUnit:'Hebei',notes:'An important political centre during Cao Wei, the Sixteen Kingdoms and the Northern Dynasties.',aliases:['Yecheng']},
  jiankang: {historicalName:'Jiankang',modernName:'Nanjing',modernAdministrativeUnit:'Jiangsu',notes:'Capital of Eastern Wu, Eastern Jin and the Southern Dynasties.',aliases:['Jianye','Jinling']},
  chengdu: {historicalName:'Chengdu',modernName:'Chengdu',modernAdministrativeUnit:'Sichuan',notes:'Capital of Shu Han.',aliases:[]},
  xiangyang: {historicalName:'Xiangyang',modernName:'Xiangyang',modernAdministrativeUnit:'Hubei',notes:'An important military and transport centre in the Han River basin.',aliases:[]},
  chibi: {historicalName:'Chibi',modernName:'Around Chibi',modernAdministrativeUnit:'Hubei',notes:'The region traditionally associated with the Battle of Red Cliffs during the Three Kingdoms era.',aliases:['Red Cliffs']},
  hefei: {historicalName:'Hefei',modernName:'Hefei',modernAdministrativeUnit:'Anhui',notes:'A major military centre between the Yangtze and Huai rivers.',aliases:[]},
  youzhou: {historicalName:'Youzhou',modernName:'Beijing and surrounding areas',modernAdministrativeUnit:'Beijing area',notes:'An important regional name on the northern frontier.',aliases:[]},
  liangzhou: {historicalName:'Liangzhou',modernName:'Wuwei and the Hexi Corridor',modernAdministrativeUnit:'Gansu',notes:'An important region of the Hexi Corridor.',aliases:[]},
  yangzhou: {historicalName:'Yangzhou',modernName:'Around Yangzhou',modernAdministrativeUnit:'Jiangsu',notes:'A transport centre linking the Yangtze–Huai region and the lands south of the Yangtze.',aliases:[]},
  kaifeng: {historicalName:'Kaifeng',modernName:'Kaifeng',modernAdministrativeUnit:'Henan',notes:'Capital of several governments during the Five Dynasties.',aliases:['Daliang','Bianzhou']},
};
