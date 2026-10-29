import type { FromSchema } from 'json-schema-to-ts';
import schema from './release-schema.generated';

export type ReleaseManifest = FromSchema<typeof schema>;
export type ReleasePackage = ReleaseManifest['packages'][number];
export type ReleaseFile = ReleasePackage['files'][number];
export type ComplianceProfile = ReleaseManifest['complianceProfile'];
