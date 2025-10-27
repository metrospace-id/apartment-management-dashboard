import {
  Formio,
  Templates,
  FormBuilder as FormioBuilder,
  Form as FormioForm
} from '@tsed/react-formio'
import tailwind from '@tsed/tailwind-formio'

Formio.use(tailwind)
Templates.framework = 'tailwind'

interface FormBuilderProps {
  formComponent?: string
  readOnly?: boolean
  disabled?: boolean
  submission?: any
  onChange?: (value: any) => void
}

export const FormBuilder = ({
  formComponent,
  onChange,
  readOnly,
  disabled,
  submission
}: FormBuilderProps) => (
  <div
    className={`w-full ${readOnly || disabled ? 'pointer-events-none' : ''}`}
  >
    <FormioBuilder
      components={JSON.parse(formComponent || '[]')}
      options={{
        noDefaultSubmitButton: true,
        template: 'tailwind',
        iconset: 'bx'
      }}
      onChange={(value) => onChange?.(value)}
    />
  </div>
)

export const Form = ({
  formComponent,
  onChange,
  readOnly,
  disabled,
  submission
}: FormBuilderProps) => (
  <div
    className={`w-full ${readOnly || disabled ? 'pointer-events-none' : ''}`}
  >
    <FormioForm
      submission={{ data: submission }}
      form={{
        display: 'form',
        components: JSON.parse(formComponent || '[]')
      }}
      onChange={(value) => onChange?.(value)}
    />
  </div>
)

export default FormBuilder
