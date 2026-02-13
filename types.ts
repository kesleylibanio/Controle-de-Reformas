
export enum ShipmentStatus {
  AWAITING = 'Aguardando Retorno',
  PARTIAL = 'Retorno Parcial',
  FINISHED = 'Finalizada'
}

export interface ReturnEvent {
  id: string;
  date: string;
  invoiceNumber: string;
  reformed: number;
  repaired: number;
  exchanged: number;
  failed: number;
  bonusesRedeemed?: number;
}

export interface Shipment {
  id: string;
  number: string;
  sendDate: string;
  quantitySent: number;
  status: ShipmentStatus;
  returns: ReturnEvent[];
}

export interface BonusStats {
  totalSent: number;
  totalReformed: number;
  totalRepaired: number;
  totalExchanged: number;
  totalFailed: number;
  totalBonusEarned: number;
  totalBonusPaid: number;
  pendingBonuses: number;
}
