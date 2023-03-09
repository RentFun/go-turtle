interface Window {
  ethereum: any;
}

interface IUserNft {
  tokenId: number;
  tokenUri: string;
}

interface IMetadata {
  name: string;
  description: string;
  componentIndices: IComponentIndices;
  attributes: IAttribute[];
  image: string;
}

interface IAttribute {
  trait_type: string;
  value: string | number;
}

interface IComponentIndices {
  eyes: string;
  hands: string;
  head: string;
  legs: string;
  shell: string;
  shellOuter: string;
  tail: string;
}

interface IUserNftWithMetadata extends IUserNft {
  metadata: IMetadata;
  rented: boolean;
  endTime: number;
  vault: string;
  contract_: string;
  tokenId: number,
}

interface Rental {
  renter: string,
  contract_: string,
  tokenId: number,
  vault: string,
  endTime: number,
}

interface TokenDetail {
  contract_: string,
  tokenId: number,
  depositor: string,
  vault: string,
  payment: string,
  unitFee: number,
  lastRentIdx: number,
  endTime: number,
  rentStatus: number,
}


