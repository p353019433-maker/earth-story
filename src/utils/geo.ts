import * as THREE from 'three'

/**
 * 将经纬度坐标转换为 3D 球面上的笛卡尔坐标
 * @param lat 纬度 (-90 ~ 90)
 * @param lng 经度 (-180 ~ 180)
 * @param radius 球体半径
 * @returns THREE.Vector3 3D 坐标
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  // three-globe 内部对 globe 组施加了 rotation.y = -PI/2
  // 使本初子午线朝向 Z 轴正方向，需同步旋转坐标
  // 旋转矩阵 Y(-PI/2): (x, y, z) → (-z, y, x)
  return new THREE.Vector3(-z, y, x)
}
