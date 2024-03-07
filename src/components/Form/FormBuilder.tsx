import { Formio, Templates, FormBuilder as FormioBuilder } from '@tsed/react-formio'
import tailwind from '@tsed/tailwind-formio'

Formio.use(tailwind)
Templates.framework = 'tailwind'

interface FormBuilderProps {
  formComponent?: string
  readOnly?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
}

function FormBuilder({
  formComponent, onChange, readOnly, disabled,
}: FormBuilderProps) {
  return (
    <div className={`w-full ${readOnly || disabled ? 'pointer-events-none' : ''}`}>
      <FormioBuilder
        components={JSON.parse(formComponent || '[]')}
        options={{ noDefaultSubmitButton: true, template: 'tailwind', iconset: 'bx' }}
        onChange={(value) => onChange?.(JSON.stringify(value))}
      />
    </div>
  )
}

export default FormBuilder
