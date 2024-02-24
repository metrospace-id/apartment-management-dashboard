import { ACCESS_CARD_TYPE, VEHICLE_TYPE } from 'constants/accessCard'

export const getAccessCardByType = (typeId: number) => ACCESS_CARD_TYPE.find((accessCardType) => accessCardType.id === typeId)

export const getVehicleByType = (typeId: number) => VEHICLE_TYPE.find((vehicleType) => vehicleType.id === typeId)
