import { schema } from 'normalizr';

import Subdomain from './common/Subdomain';

const subdomainName = 'analytics';

const templateIdentity = new schema.Entity('templates');

const executionIdentity = new schema.Entity('executions', {
  template: templateIdentity
});
const jobEntity = new schema.Entity('jobs', {
  template: templateIdentity
});

const categoriesEntitiesMap = {
  executions: [executionIdentity],
  jobs: [jobEntity],
  templates: [templateIdentity]
}
const subdomain = new Subdomain({ categoriesEntitiesMap, subdomainName })

export default subdomain
