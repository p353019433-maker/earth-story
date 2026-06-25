export type Region = '全部' | '亚洲' | '欧洲' | '非洲' | '北美洲' | '南美洲' | '大洋洲'

const regions: Region[] = ['全部', '亚洲', '欧洲', '非洲', '北美洲', '南美洲', '大洋洲']

/**
 * 根据经纬度判断所属大洲
 * 简化版分类，覆盖主要陆地区域
 */
export function classifyRegion(lat: number, lng: number): Exclude<Region, '全部'> {
  // 亚洲: 大致 0°-55°N, 25°E-150°E
  if (lat > 0 && lat < 55 && lng > 25 && lng < 150) return '亚洲'
  // 欧洲: 大致 35°N-72°N, -10°E-40°E
  if (lat > 35 && lat < 72 && lng > -10 && lng < 40) return '欧洲'
  // 非洲: 大致 -35°S-37°N, -20°E-55°E
  if (lat > -35 && lat < 37 && lng > -20 && lng < 55) return '非洲'
  // 北美洲: 大致 15°N-72°N, -170°W--50°W
  if (lat > 15 && lat < 72 && lng > -170 && lng < -50) return '北美洲'
  // 南美洲: 大致 -56°S-12°N, -82°W--34°W
  if (lat > -56 && lat < 12 && lng > -82 && lng < -34) return '南美洲'
  // 大洋洲: 大致 -47°S-0°N, 110°E-180°E (含澳大利亚、新西兰、巴布亚新几内亚)
  if (lat > -47 && lat < 0 && lng > 110 && lng < 180) return '大洋洲'

  // 默认：根据经度粗分
  if (lng > 60) return '亚洲'
  if (lng > -30) return '欧洲'
  return '北美洲'
}

export const regionCenter: Record<Exclude<Region, '全部'>, { lat: number; lng: number; zoom: number }> = {
  // 亚洲大陆地理中心：新疆乌鲁木齐县 43°40'N, 87°19'E（中科院1992年测定）
  '亚洲': { lat: 43.68, lng: 87.33, zoom: 190 },
  // 欧洲地理中心：立陶宛维尔纽斯北 54°54'N, 25°19'E（法国国家地理研究院1989年测定）
  '欧洲': { lat: 54.9, lng: 25.32, zoom: 190 },
  // 非洲地理中心：喀麦隆洛贝凯国家公园 约2°N, 16°E
  '非洲': { lat: 2.0, lng: 16.0, zoom: 200 },
  // 北美洲地理中心：美国北达科他州Rugby 48°21'N, 100°W（USGS 1931年测定）
  '北美洲': { lat: 48.35, lng: -100.0, zoom: 190 },
  // 南美洲地理中心：巴西库亚巴 15°36'S, 56°06'W（Rondon 1909年测定）
  '南美洲': { lat: -15.6, lng: -56.1, zoom: 200 },
  // 大洋洲地理中心：澳大利亚爱丽斯泉以西 23°33'S, 133°24'E
  '大洋洲': { lat: -23.55, lng: 133.4, zoom: 210 },
}

export { regions }
