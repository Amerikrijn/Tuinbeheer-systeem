import { 
  validateTuin, 
  validatePlantvak, 
  validateBloem, 
  validateForm,
  ValidationUtils,
  Validator
} from '../../lib/validation'
import type { TuinFormData, PlantvakFormData, BloemFormData } from '../../lib/types'

describe('Validation Utilities', () => {
  describe('ValidationUtils', () => {
    describe('isRequired', () => {
      it('should return true for valid values', () => {
        expect(ValidationUtils.isRequired('test')).toBe(true)
        expect(ValidationUtils.isRequired(0)).toBe(true)
        expect(ValidationUtils.isRequired(false)).toBe(true)
        expect(ValidationUtils.isRequired([])).toBe(true)
        expect(ValidationUtils.isRequired({})).toBe(true)
      })

      it('should return false for invalid values', () => {
        expect(ValidationUtils.isRequired('')).toBe(false)
        expect(ValidationUtils.isRequired(null)).toBe(false)
        expect(ValidationUtils.isRequired(undefined)).toBe(false)
      })
    })

    describe('isValidEmail', () => {
      it('should validate correct email addresses', () => {
        expect(ValidationUtils.isValidEmail('test@example.com')).toBe(true)
        expect(ValidationUtils.isValidEmail('user.name@domain.co.uk')).toBe(true)
        expect(ValidationUtils.isValidEmail('test+tag@example.org')).toBe(true)
      })

      it('should reject invalid email addresses', () => {
        expect(ValidationUtils.isValidEmail('invalid-email')).toBe(false)
        expect(ValidationUtils.isValidEmail('test@')).toBe(false)
        expect(ValidationUtils.isValidEmail('@example.com')).toBe(false)
        expect(ValidationUtils.isValidEmail('test.example.com')).toBe(false)
      })
    })

    describe('isValidDate', () => {
      it('should validate correct date formats', () => {
        expect(ValidationUtils.isValidDate('2024-01-01')).toBe(true)
        expect(ValidationUtils.isValidDate('2024-12-31')).toBe(true)
        expect(ValidationUtils.isValidDate('2000-02-29')).toBe(true) // leap year
      })

      it('should reject invalid date formats', () => {
        expect(ValidationUtils.isValidDate('01-01-2024')).toBe(false)
        expect(ValidationUtils.isValidDate('2024/01/01')).toBe(false)
        expect(ValidationUtils.isValidDate('2024-13-01')).toBe(false)
        expect(ValidationUtils.isValidDate('2024-01-32')).toBe(false)
        expect(ValidationUtils.isValidDate('invalid-date')).toBe(false)
      })
    })

    describe('isValidNumber', () => {
      it('should validate numbers', () => {
        expect(ValidationUtils.isValidNumber('123')).toBe(true)
        expect(ValidationUtils.isValidNumber('123.45')).toBe(true)
        expect(ValidationUtils.isValidNumber(123)).toBe(true)
        expect(ValidationUtils.isValidNumber(123.45)).toBe(true)
        expect(ValidationUtils.isValidNumber('0')).toBe(true)
        expect(ValidationUtils.isValidNumber('-123')).toBe(true)
      })

      it('should reject non-numbers', () => {
        expect(ValidationUtils.isValidNumber('abc')).toBe(false)
        expect(ValidationUtils.isValidNumber('123abc')).toBe(false)
        expect(ValidationUtils.isValidNumber('')).toBe(false)
        expect(ValidationUtils.isValidNumber('--123')).toBe(false)
      })
    })

    describe('isInRange', () => {
      it('should validate numbers within range', () => {
        expect(ValidationUtils.isInRange(5, 1, 10)).toBe(true)
        expect(ValidationUtils.isInRange(1, 1, 10)).toBe(true)
        expect(ValidationUtils.isInRange(10, 1, 10)).toBe(true)
        expect(ValidationUtils.isInRange(5, undefined, 10)).toBe(true)
        expect(ValidationUtils.isInRange(5, 1, undefined)).toBe(true)
      })

      it('should reject numbers outside range', () => {
        expect(ValidationUtils.isInRange(0, 1, 10)).toBe(false)
        expect(ValidationUtils.isInRange(11, 1, 10)).toBe(false)
        expect(ValidationUtils.isInRange(-1, 0, 10)).toBe(false)
      })
    })

    describe('isValidLength', () => {
      it('should validate strings within length limits', () => {
        expect(ValidationUtils.isValidLength('test', 1, 10)).toBe(true)
        expect(ValidationUtils.isValidLength('a', 1, 10)).toBe(true)
        expect(ValidationUtils.isValidLength('1234567890', 1, 10)).toBe(true)
        expect(ValidationUtils.isValidLength('test', undefined, 10)).toBe(true)
        expect(ValidationUtils.isValidLength('test', 1, undefined)).toBe(true)
      })

      it('should reject strings outside length limits', () => {
        expect(ValidationUtils.isValidLength('', 1, 10)).toBe(false)
        expect(ValidationUtils.isValidLength('12345678901', 1, 10)).toBe(false)
        expect(ValidationUtils.isValidLength('test', 5, 10)).toBe(false)
      })
    })
  })

  describe('Validator Class', () => {
    let validator: Validator

    beforeEach(() => {
      validator = new Validator()
    })

    describe('validateString', () => {
      it('should validate required strings', () => {
        validator.validateString('name', 'test', { required: true })
        const result = validator.getResult()
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should reject empty required strings', () => {
        validator.validateString('name', '', { required: true })
        const result = validator.getResult()
        expect(result.isValid).toBe(false)
        expect(result.errors).toHaveLength(1)
        expect(result.errors[0].field).toBe('name')
        expect(result.errors[0].message).toBe('Dit veld is verplicht')
      })

      it('should validate string length', () => {
        validator.validateString('name', 'ab', { minLength: 3 })
        const result = validator.getResult()
        expect(result.isValid).toBe(false)
        expect(result.errors[0].message).toBe('Minimaal 3 karakters vereist')
      })

      it('should validate string patterns', () => {
        validator.validateString('id', 'invalid-id!', { 
          pattern: /^[A-Z0-9\-]+$/i,
          patternMessage: 'Alleen letters, cijfers en streepjes toegestaan'
        })
        const result = validator.getResult()
        expect(result.isValid).toBe(false)
        expect(result.errors[0].message).toBe('Alleen letters, cijfers en streepjes toegestaan')
      })
    })

    describe('validateNumber', () => {
      it('should validate required numbers', () => {
        validator.validateNumber('height', 50, { required: true })
        const result = validator.getResult()
        expect(result.isValid).toBe(true)
      })

      it('should reject invalid numbers', () => {
        validator.validateNumber('height', 'abc', { required: true })
        const result = validator.getResult()
        expect(result.isValid).toBe(false)
        expect(result.errors[0].message).toBe('Moet een geldig nummer zijn')
      })

      it('should validate number ranges', () => {
        validator.validateNumber('height', 150, { min: 0, max: 100 })
        const result = validator.getResult()
        expect(result.isValid).toBe(false)
        expect(result.errors[0].message).toBe('Maximale waarde is 100')
      })

      it('should validate integers', () => {
        validator.validateNumber('count', 5.5, { integer: true })
        const result = validator.getResult()
        expect(result.isValid).toBe(false)
        expect(result.errors[0].message).toBe('Moet een geheel getal zijn')
      })
    })

    describe('validateDate', () => {
      it('should validate correct dates', () => {
        validator.validateDate('planting_date', '2024-01-01', true)
        const result = validator.getResult()
        expect(result.isValid).toBe(true)
      })

      it('should reject invalid dates', () => {
        validator.validateDate('planting_date', '2024-13-01', true)
        const result = validator.getResult()
        expect(result.isValid).toBe(false)
        expect(result.errors[0].message).toBe('Ongeldige datum (YYYY-MM-DD)')
      })
    })

    describe('validateOption', () => {
      it('should validate valid options', () => {
        validator.validateOption('status', 'healthy', ['healthy', 'diseased'], true)
        const result = validator.getResult()
        expect(result.isValid).toBe(true)
      })

      it('should reject invalid options', () => {
        validator.validateOption('status', 'invalid', ['healthy', 'diseased'], true)
        const result = validator.getResult()
        expect(result.isValid).toBe(false)
        expect(result.errors[0].message).toBe('Moet een van de volgende zijn: healthy, diseased')
      })
    })

    describe('validateColor', () => {
      it('should validate hex colors', () => {
        validator.validateColor('color', '#FF0000', true)
        const result = validator.getResult()
        expect(result.isValid).toBe(true)
      })

      it('should reject invalid colors', () => {
        validator.validateColor('color', 'red', true)
        const result = validator.getResult()
        expect(result.isValid).toBe(false)
        expect(result.errors[0].message).toBe('Ongeldige kleurcode (bijv. #FF0000)')
      })
    })
  })

  describe('validateTuin', () => {
    const validTuinData: TuinFormData = {
      name: 'Test Garden',
      location: 'Test Location',
      description: 'A beautiful test garden',
      total_area: '100m²',
      length: '10',
      width: '10',
      garden_type: 'vegetable',
      established_date: '2024-01-01',
      notes: 'Some notes about the garden'
    }

    it('should validate valid tuin data', () => {
      const result = validateTuin(validTuinData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should require name and location', () => {
      const result = validateTuin({ ...validTuinData, name: '', location: '' })
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors.find(e => e.field === 'name')).toBeDefined()
      expect(result.errors.find(e => e.field === 'location')).toBeDefined()
    })

    it('should validate name length', () => {
      const result = validateTuin({ ...validTuinData, name: 'a' })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('name')
      expect(result.errors[0].message).toBe('Minimaal 2 karakters vereist')
    })

    it('should validate garden type options', () => {
      const result = validateTuin({ ...validTuinData, garden_type: 'invalid' as any })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('garden_type')
      expect(result.errors[0].message).toContain('Moet een van de volgende zijn')
    })

    it('should validate established date format', () => {
      const result = validateTuin({ ...validTuinData, established_date: '01-01-2024' })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('established_date')
      expect(result.errors[0].message).toBe('Ongeldige datum (YYYY-MM-DD)')
    })
  })

  describe('validatePlantvak', () => {
    const validPlantvakData: PlantvakFormData = {
      id: 'BED-001',
      name: 'Test Plant Bed',
      location: 'North Side',
      size: '2x3m',
      soilType: 'Clay',
      sunExposure: 'full-sun',
      description: 'A test plant bed for vegetables'
    }

    it('should validate valid plantvak data', () => {
      const result = validatePlantvak(validPlantvakData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should require all fields', () => {
      const result = validatePlantvak({
        id: '',
        name: '',
        location: '',
        size: '',
        soilType: '',
        sunExposure: 'full-sun',
        description: ''
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate ID format', () => {
      const result = validatePlantvak({ ...validPlantvakData, id: 'invalid id!' })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('id')
      expect(result.errors[0].message).toBe('Plantvak ID mag alleen letters, cijfers en streepjes bevatten')
    })

    it('should validate sun exposure options', () => {
      const result = validatePlantvak({ ...validPlantvakData, sunExposure: 'invalid' as any })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('sunExposure')
      expect(result.errors[0].message).toContain('Moet een van de volgende zijn')
    })

    it('should validate description length', () => {
      const result = validatePlantvak({ ...validPlantvakData, description: 'short' })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('description')
      expect(result.errors[0].message).toBe('Minimaal 10 karakters vereist')
    })
  })

  describe('validateBloem', () => {
    const validBloemData: BloemFormData = {
      name: 'Test Plant',
      scientific_name: 'Testus plantus',
      variety: 'Test Variety',
      color: 'Red',
      height: 30,
      planting_date: '2024-01-01',
      expected_harvest_date: '2024-06-01',
      status: 'healthy',
      notes: 'Test notes',
      care_instructions: 'Water regularly',
      watering_frequency: 7,
      fertilizer_schedule: 'Monthly'
    }

    it('should validate valid bloem data', () => {
      const result = validateBloem(validBloemData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should require name and status', () => {
      const result = validateBloem({ ...validBloemData, name: '', status: '' as any })
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors.find(e => e.field === 'name')).toBeDefined()
      expect(result.errors.find(e => e.field === 'status')).toBeDefined()
    })

    it('should validate status options', () => {
      const result = validateBloem({ ...validBloemData, status: 'invalid' as any })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('status')
      expect(result.errors[0].message).toContain('Moet een van de volgende zijn')
    })

    it('should validate height range', () => {
      const result = validateBloem({ ...validBloemData, height: -5 })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('height')
      expect(result.errors[0].message).toBe('Minimale waarde is 0')
    })

    it('should validate date formats', () => {
      const result = validateBloem({ ...validBloemData, planting_date: '01-01-2024' })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('planting_date')
      expect(result.errors[0].message).toBe('Ongeldige datum (YYYY-MM-DD)')
    })

    it('should validate watering frequency as integer', () => {
      const result = validateBloem({ ...validBloemData, watering_frequency: 7.5 })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('watering_frequency')
      expect(result.errors[0].message).toBe('Moet een geheel getal zijn')
    })

    it('should validate harvest date after planting date', () => {
      const result = validateBloem({ 
        ...validBloemData, 
        planting_date: '2024-06-01',
        expected_harvest_date: '2024-01-01'
      })
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('expected_harvest_date')
      expect(result.errors[0].message).toBe('Oogstdatum moet na de plantdatum liggen')
    })
  })

  describe('validateForm', () => {
    it('should validate form with custom rules', () => {
      const data = { name: 'test', age: 25 }
      const rules = {
        name: (value: string) => value.length < 2 ? 'Name too short' : null,
        age: (value: number) => value < 18 ? 'Must be adult' : null
      }

      const result = validateForm(data, rules)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return errors for invalid data', () => {
      const data = { name: 'a', age: 16 }
      const rules = {
        name: (value: string) => value.length < 2 ? 'Name too short' : null,
        age: (value: number) => value < 18 ? 'Must be adult' : null
      }

      const result = validateForm(data, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors.find(e => e.field === 'name')?.message).toBe('Name too short')
      expect(result.errors.find(e => e.field === 'age')?.message).toBe('Must be adult')
    })
  })
})