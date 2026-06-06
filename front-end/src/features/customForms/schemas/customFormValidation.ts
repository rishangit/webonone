import * as yup from 'yup';

export const customFormMetaSchema = yup.object({
  name: yup.string().required('Form name is required'),
  description: yup.string().optional(),
  isActive: yup.boolean().optional(),
});
