import { useState } from 'react';

import { useAuth } from 'components/contexts/auth';

import { writeOneItem } from 'services/items';

export default function useSubmit({ category, http, item, onSubmitted }) {
  const { accessToken } = useAuth();
  const [saving, setSaving] = useState(false);

  const submitFn = (body) => {
    setSaving(true);

    const id = item?.id;
    const subdomain = 'registry';

    writeOneItem({ accessToken, body, category, http, id, subdomain })
      .then((data) => {
        setSaving(false);
        onSubmitted({ data });
      })
      .catch((error) => {
        setSaving(false);
        onSubmitted({ error });
      });
  };

  return { saving, submitFn };
}
