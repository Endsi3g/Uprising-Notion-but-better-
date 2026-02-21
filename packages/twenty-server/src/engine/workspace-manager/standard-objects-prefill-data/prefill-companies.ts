import { type EntityManager } from 'typeorm';
import { FieldActorSource } from 'twenty-shared/types';

export const PLOMBERIE_MARTIN_ID = 'c776ee49-f608-4a77-8cc8-6fe96ae1e43f';
export const TOITURES_LAVOIE_ID = 'f45ee421-8a3e-4aa5-a1cf-7207cc6754e1';
export const ELECTRICITE_TREMBLAY_ID = '1f70157c-4ea5-4d81-bc49-e1401abfbb94';
export const RENOVATIONS_GAGNON_ID = '9d5bcf43-7d38-4e88-82cb-d6d4ce638bf0';
export const PAYSAGEMENT_COTE_ID = '06290608-8bf0-4806-99ae-a715a6a93fad';

export const prefillCompanies = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.company`, [
      'id',
      'name',
      'domainNamePrimaryLinkUrl',
      'addressAddressStreet1',
      'addressAddressStreet2',
      'addressAddressCity',
      'addressAddressState',
      'addressAddressPostcode',
      'addressAddressCountry',
      'employees',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'updatedBySource',
      'updatedByWorkspaceMemberId',
      'updatedByName',
    ])
    .orIgnore()
    .values([
      {
        id: PLOMBERIE_MARTIN_ID,
        name: 'Plomberie Martin',
        domainNamePrimaryLinkUrl: 'https://plomberiemartin.ca',
        addressAddressStreet1: '4520 Rue Saint-Denis',
        addressAddressStreet2: null,
        addressAddressCity: 'Montréal',
        addressAddressState: 'QC',
        addressAddressPostcode: 'H2J 2L3',
        addressAddressCountry: 'Canada',
        employees: 8,
        position: 1,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
      {
        id: TOITURES_LAVOIE_ID,
        name: 'Toitures Lavoie',
        domainNamePrimaryLinkUrl: 'https://toitureslavoie.ca',
        addressAddressStreet1: '1200 Boulevard Charest',
        addressAddressStreet2: null,
        addressAddressCity: 'Québec',
        addressAddressState: 'QC',
        addressAddressPostcode: 'G1N 2E1',
        addressAddressCountry: 'Canada',
        employees: 12,
        position: 2,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
      {
        id: ELECTRICITE_TREMBLAY_ID,
        name: 'Électricité Tremblay',
        domainNamePrimaryLinkUrl: 'https://electricitetremblay.ca',
        addressAddressStreet1: '3100 Boulevard Saint-Martin',
        addressAddressStreet2: null,
        addressAddressCity: 'Laval',
        addressAddressState: 'QC',
        addressAddressPostcode: 'H7T 1A1',
        addressAddressCountry: 'Canada',
        employees: 6,
        position: 3,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
      {
        id: RENOVATIONS_GAGNON_ID,
        name: 'Rénovations Gagnon',
        domainNamePrimaryLinkUrl: 'https://renovationsgagnon.ca',
        addressAddressStreet1: '850 Rue King Ouest',
        addressAddressStreet2: null,
        addressAddressCity: 'Sherbrooke',
        addressAddressState: 'QC',
        addressAddressPostcode: 'J1H 1R6',
        addressAddressCountry: 'Canada',
        employees: 15,
        position: 4,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
      {
        id: PAYSAGEMENT_COTE_ID,
        name: 'Paysagement Côté',
        domainNamePrimaryLinkUrl: 'https://paysagementcote.ca',
        addressAddressStreet1: '290 Boulevard des Laurentides',
        addressAddressStreet2: null,
        addressAddressCity: 'Longueuil',
        addressAddressState: 'QC',
        addressAddressPostcode: 'J4H 1J4',
        addressAddressCountry: 'Canada',
        employees: 10,
        position: 5,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
    ])
    .returning('*')
    .execute();
};
