export type PlantType = '乔木' | '花卉'
export type ClimateType = '温带' | '湿地'

export const CLIMATE_OPTIONS: ClimateType[] = ['温带', '湿地']

export interface Plant {
  id: string
  name: string
  scientificName: string
  lat: number
  lng: number
  altitude: number
  type: PlantType
  climate: ClimateType
}

export const plantsData: Plant[] = [
  { id: 'p01', name: '银杏', scientificName: 'Ginkgo biloba', lat: 34.3, lng: 108.9, altitude: 1500, type: '乔木', climate: '温带' },
  { id: 'p02', name: '水杉', scientificName: 'Metasequoia glyptostroboides', lat: 30.5, lng: 109.4, altitude: 800, type: '乔木', climate: '湿地' },
  { id: 'p03', name: '巨杉', scientificName: 'Sequoiadendron giganteum', lat: 36.5, lng: -118.7, altitude: 2000, type: '乔木', climate: '温带' },
  { id: 'p04', name: '王莲', scientificName: 'Victoria amazonica', lat: -3.1, lng: -60.0, altitude: 50, type: '花卉', climate: '湿地' },
  { id: 'p05', name: '日本银杏', scientificName: 'Ginkgo biloba', lat: 35.7, lng: 139.7, altitude: 100, type: '乔木', climate: '温带' },
  { id: 'p06', name: '红杉', scientificName: 'Sequoia sempervirens', lat: 41.2, lng: -124.0, altitude: 500, type: '乔木', climate: '温带' },
  { id: 'p07', name: '睡莲', scientificName: 'Nymphaea tetragona', lat: 59.9, lng: 30.3, altitude: 20, type: '花卉', climate: '湿地' },
  { id: 'p08', name: '猴面包树', scientificName: 'Adansonia digitata', lat: -20.0, lng: 46.0, altitude: 800, type: '乔木', climate: '温带' },
  { id: 'p09', name: '巨花魔芋', scientificName: 'Amorphophallus titanum', lat: 0.5, lng: 101.5, altitude: 300, type: '花卉', climate: '湿地' },
  { id: 'p10', name: '龙血树', scientificName: 'Dracaena cinnabari', lat: 12.5, lng: 54.0, altitude: 1200, type: '乔木', climate: '温带' },
  { id: 'p11', name: '百岁兰', scientificName: 'Welwitschia mirabilis', lat: -23.0, lng: 15.0, altitude: 600, type: '花卉', climate: '温带' },
  { id: 'p12', name: '桉树', scientificName: 'Eucalyptus regnans', lat: -37.8, lng: 145.3, altitude: 900, type: '乔木', climate: '温带' },
  { id: 'p13', name: '大王花', scientificName: 'Rafflesia arnoldii', lat: 4.5, lng: 101.0, altitude: 400, type: '花卉', climate: '湿地' },
  { id: 'p14', name: '胡杨', scientificName: 'Populus euphratica', lat: 40.1, lng: 94.7, altitude: 1100, type: '乔木', climate: '温带' },
  { id: 'p15', name: '红树林', scientificName: 'Rhizophora mangle', lat: 25.8, lng: -80.2, altitude: 5, type: '乔木', climate: '湿地' },
  { id: 'p16', name: '雪莲花', scientificName: 'Saussurea involucrata', lat: 43.0, lng: 81.0, altitude: 3500, type: '花卉', climate: '温带' },
  { id: 'p17', name: '鸢尾', scientificName: 'Iris pseudacorus', lat: 51.5, lng: -0.1, altitude: 30, type: '花卉', climate: '湿地' },
  { id: 'p18', name: '橡胶树', scientificName: 'Hevea brasiliensis', lat: -8.0, lng: -70.0, altitude: 200, type: '乔木', climate: '温带' },
  { id: 'p19', name: '薰衣草', scientificName: 'Lavandula angustifolia', lat: 43.8, lng: 5.8, altitude: 800, type: '花卉', climate: '温带' },
  { id: 'p20', name: '巴西红木', scientificName: 'Caesalpinia echinata', lat: -15.0, lng: -39.0, altitude: 300, type: '乔木', climate: '温带' },
]
