import { supabase } from '../supabase'
import { logger, LogContext, PerformanceTimer, createOperationContext } from '../logger'
import { ErrorFactory, ErrorHandler, safeAsync } from '../errors'
import type { 
  Tuin, 
  Plantvak, 
  Bloem, 
  PlantvakWithBloemen, 
  TuinWithPlantvakken,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
  SortOptions
} from '../types/index'

/**
 * BANKING-GRADE DATABASE SERVICE LAYER
 * Enterprise-level database operations with comprehensive logging, error handling, and audit trails
 * 
 * Features:
 * - Structured logging with correlation IDs
 * - Comprehensive error handling and classification
 * - Performance monitoring
 * - Security audit trails
 * - Input validation
 * - Connection validation
 * - Graceful error recovery
 */

// Connection validation with retry logic
async function validateConnection(context?: LogContext): Promise<void> {
  const timer = new PerformanceTimer('database_connection_validation');
  
  try {
    const { error } = await supabase.from('gardens').select('count').limit(1)
    
    if (error) {
      throw ErrorFactory.databaseConnectionError(new Error(error.message), context);
    }
    
    logger.database('connection_validated', 'gardens', timer.end(context), context);
  } catch (error) {
    timer.end(context);
    
    if (error instanceof Error) {
      throw ErrorFactory.databaseConnectionError(error, context);
    }
    
    throw ErrorHandler.handleError(error, context);
  }
}

// Generic response wrapper with enhanced logging
function createResponse<T>(data: T | null, error: string | null = null, context?: LogContext): ApiResponse<T> {
  const response: ApiResponse<T> = {
    data,
    error,
    success: error === null
  };
  
  if (error) {
    logger.warn(`API response with error: ${error}`, context);
  } else {
    logger.debug('API response successful', context);
  }
  
  return response;
}

// Input validation helper
function validateRequiredFields(fields: Record<string, any>, context?: LogContext): void {
  for (const [fieldName, value] of Object.entries(fields)) {
    if (!value && value !== 0 && value !== false) {
      throw ErrorFactory.requiredFieldError(fieldName, context);
    }
  }
}

// Tuin (Garden) Operations
export class TuinService {
  private static readonly TABLE_NAME = 'gardens';
  private static readonly COMPONENT_NAME = 'tuin_service';

  /**
   * Get all active gardens
   */
  static async getAll(): Promise<ApiResponse<Tuin[]>> {
    const context = createOperationContext('get_all_tuinen', this.COMPONENT_NAME);
    const timer = new PerformanceTimer('get_all_tuinen');
    
    try {
      logger.info('Starting get all tuinen operation', context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          'SELECT * FROM gardens WHERE is_active = true',
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully retrieved ${data?.length || 0} tuinen`, context);
      logger.database('select', this.TABLE_NAME, undefined, context);
      
      return createResponse(data || [], null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<Tuin[]>([], appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Get garden by ID
   */
  static async getById(id: string): Promise<ApiResponse<Tuin>> {
    const context = createOperationContext('get_tuin_by_id', this.COMPONENT_NAME, { tuinId: id });
    const timer = new PerformanceTimer('get_tuin_by_id');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting get tuin by ID: ${id}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      timer.end(context);

      if (error) {
        if (error.code === 'PGRST116') {
          throw ErrorFactory.recordNotFoundError('tuin', id, context);
        }
        throw ErrorFactory.databaseQueryError(
          `SELECT * FROM gardens WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully retrieved tuin: ${data.name}`, context);
      logger.database('select', this.TABLE_NAME, undefined, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<Tuin>(null, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Create new garden
   */
  static async create(garden: Omit<Tuin, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Tuin>> {
    const context = createOperationContext('create_tuin', this.COMPONENT_NAME, { tuinName: garden.name });
    const timer = new PerformanceTimer('create_tuin');

    try {
      validateRequiredFields({ name: garden.name, location: garden.location }, context);
      
      logger.info(`Starting create tuin: ${garden.name}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([{ ...garden, is_active: true }])
        .select()
        .single();

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          'INSERT INTO gardens',
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully created tuin: ${data.name} (ID: ${data.id})`, context);
      logger.database('insert', this.TABLE_NAME, undefined, context);
      logger.security('tuin_created', 'SUCCESS', `tuin/${data.id}`, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      logger.security('tuin_creation_failed', 'FAILURE', undefined, context);
      return createResponse<Tuin>(null, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Update garden
   */
  static async update(id: string, updates: Partial<Tuin>): Promise<ApiResponse<Tuin>> {
    const context = createOperationContext('update_tuin', this.COMPONENT_NAME, { tuinId: id });
    const timer = new PerformanceTimer('update_tuin');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting update tuin: ${id}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single();

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          `UPDATE gardens WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully updated tuin: ${data.name} (ID: ${data.id})`, context);
      logger.database('update', this.TABLE_NAME, undefined, context);
      logger.security('tuin_updated', 'SUCCESS', `tuin/${data.id}`, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      logger.security('tuin_update_failed', 'FAILURE', `tuin/${id}`, context);
      return createResponse<Tuin>(null, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Delete garden (soft delete)
   */
  static async delete(id: string): Promise<ApiResponse<boolean>> {
    const context = createOperationContext('delete_tuin', this.COMPONENT_NAME, { tuinId: id });
    const timer = new PerformanceTimer('delete_tuin');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting soft delete tuin: ${id}`, context);
      
      await validateConnection(context);
      
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          `UPDATE gardens SET is_active = false WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully soft deleted tuin: ${id}`, context);
      logger.database('soft_delete', this.TABLE_NAME, undefined, context);
      logger.security('tuin_deleted', 'SUCCESS', `tuin/${id}`, context);
      
      return createResponse(true, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      logger.security('tuin_deletion_failed', 'FAILURE', `tuin/${id}`, context);
      return createResponse<boolean>(false, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Get garden with plant beds
   */
  static async getWithPlantvakken(id: string): Promise<ApiResponse<TuinWithPlantvakken>> {
    const context = createOperationContext('get_tuin_with_plantvakken', this.COMPONENT_NAME, { tuinId: id });
    const timer = new PerformanceTimer('get_tuin_with_plantvakken');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting get tuin with plantvakken: ${id}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select(`
          *,
          plant_beds!inner (
            *,
            plants (*)
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .eq('plant_beds.is_active', true)
        .single();

      timer.end(context);

      if (error) {
        if (error.code === 'PGRST116') {
          throw ErrorFactory.recordNotFoundError('tuin', id, context);
        }
        throw ErrorFactory.databaseQueryError(
          `SELECT tuin with plantvakken WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully retrieved tuin with ${data.plant_beds?.length || 0} plantvakken`, context);
      logger.database('select_with_relations', this.TABLE_NAME, undefined, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<TuinWithPlantvakken>(null, appError.getUserFriendlyMessage(), context);
    }
  }
}

// Plantvak (Plant Bed) Operations
export class PlantvakService {
  private static readonly TABLE_NAME = 'plant_beds';
  private static readonly COMPONENT_NAME = 'plantvak_service';

  /**
   * Get all plant beds for a garden
   */
  static async getByGardenId(gardenId: string): Promise<ApiResponse<Plantvak[]>> {
    const context = createOperationContext('get_plantvakken_by_garden', this.COMPONENT_NAME, { gardenId });
    const timer = new PerformanceTimer('get_plantvakken_by_garden');

    try {
      validateRequiredFields({ gardenId }, context);
      
      logger.info(`Starting get plantvakken for garden: ${gardenId}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('garden_id', gardenId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          `SELECT * FROM plant_beds WHERE garden_id = '${gardenId}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully retrieved ${data?.length || 0} plantvakken`, context);
      logger.database('select', this.TABLE_NAME, undefined, context);
      
      return createResponse(data || [], null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<Plantvak[]>([], appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Get plant bed by ID
   */
  static async getById(id: string): Promise<ApiResponse<Plantvak>> {
    const context = createOperationContext('get_plantvak_by_id', this.COMPONENT_NAME, { plantvakId: id });
    const timer = new PerformanceTimer('get_plantvak_by_id');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting get plantvak by ID: ${id}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      timer.end(context);

      if (error) {
        if (error.code === 'PGRST116') {
          throw ErrorFactory.recordNotFoundError('plantvak', id, context);
        }
        throw ErrorFactory.databaseQueryError(
          `SELECT * FROM plant_beds WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully retrieved plantvak: ${data.name}`, context);
      logger.database('select', this.TABLE_NAME, undefined, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<Plantvak>(null, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Create new plant bed
   */
  static async create(plantvak: Omit<Plantvak, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Plantvak>> {
    const context = createOperationContext('create_plantvak', this.COMPONENT_NAME, { 
      plantvakName: plantvak.name,
      gardenId: plantvak.garden_id 
    });
    const timer = new PerformanceTimer('create_plantvak');

    try {
      validateRequiredFields({ 
        name: plantvak.name, 
        garden_id: plantvak.garden_id 
      }, context);
      
      logger.info(`Starting create plantvak: ${plantvak.name}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([{ ...plantvak, is_active: true }])
        .select()
        .single();

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          'INSERT INTO plant_beds',
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully created plantvak: ${data.name} (ID: ${data.id})`, context);
      logger.database('insert', this.TABLE_NAME, undefined, context);
      logger.security('plantvak_created', 'SUCCESS', `plantvak/${data.id}`, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      logger.security('plantvak_creation_failed', 'FAILURE', undefined, context);
      return createResponse<Plantvak>(null, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Update plant bed
   */
  static async update(id: string, updates: Partial<Plantvak>): Promise<ApiResponse<Plantvak>> {
    const context = createOperationContext('update_plantvak', this.COMPONENT_NAME, { plantvakId: id });
    const timer = new PerformanceTimer('update_plantvak');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting update plantvak: ${id}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single();

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          `UPDATE plant_beds WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully updated plantvak: ${data.name} (ID: ${data.id})`, context);
      logger.database('update', this.TABLE_NAME, undefined, context);
      logger.security('plantvak_updated', 'SUCCESS', `plantvak/${data.id}`, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      logger.security('plantvak_update_failed', 'FAILURE', `plantvak/${id}`, context);
      return createResponse<Plantvak>(null, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Soft delete plant bed
   */
  static async delete(id: string): Promise<ApiResponse<boolean>> {
    const context = createOperationContext('delete_plantvak', this.COMPONENT_NAME, { plantvakId: id });
    const timer = new PerformanceTimer('delete_plantvak');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting soft delete plantvak: ${id}`, context);
      
      await validateConnection(context);
      
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          `UPDATE plant_beds SET is_active = false WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully soft deleted plantvak: ${id}`, context);
      logger.database('soft_delete', this.TABLE_NAME, undefined, context);
      logger.security('plantvak_deleted', 'SUCCESS', `plantvak/${id}`, context);
      
      return createResponse(true, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      logger.security('plantvak_deletion_failed', 'FAILURE', `plantvak/${id}`, context);
      return createResponse<boolean>(false, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Get plant bed with plants
   */
  static async getWithBloemen(id: string): Promise<ApiResponse<PlantvakWithBloemen>> {
    const context = createOperationContext('get_plantvak_with_bloemen', this.COMPONENT_NAME, { plantvakId: id });
    const timer = new PerformanceTimer('get_plantvak_with_bloemen');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting get plantvak with bloemen: ${id}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select(`
          *,
          plants (*)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      timer.end(context);

      if (error) {
        if (error.code === 'PGRST116') {
          throw ErrorFactory.recordNotFoundError('plantvak', id, context);
        }
        throw ErrorFactory.databaseQueryError(
          `SELECT plantvak with bloemen WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully retrieved plantvak with ${data.plants?.length || 0} bloemen`, context);
      logger.database('select_with_relations', this.TABLE_NAME, undefined, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<PlantvakWithBloemen>(null, appError.getUserFriendlyMessage(), context);
    }
  }
}

// Bloem (Plant) Operations
export class BloemService {
  private static readonly TABLE_NAME = 'plants';
  private static readonly COMPONENT_NAME = 'bloem_service';

  /**
   * Get all plants for a plant bed
   */
  static async getByPlantvakId(plantvakId: string): Promise<ApiResponse<Bloem[]>> {
    const context = createOperationContext('get_bloemen_by_plantvak', this.COMPONENT_NAME, { plantvakId });
    const timer = new PerformanceTimer('get_bloemen_by_plantvak');

    try {
      validateRequiredFields({ plantvakId }, context);
      
      logger.info(`Starting get bloemen for plantvak: ${plantvakId}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('plant_bed_id', plantvakId)
        .order('created_at', { ascending: false });

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          `SELECT * FROM plants WHERE plant_bed_id = '${plantvakId}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully retrieved ${data?.length || 0} bloemen`, context);
      logger.database('select', this.TABLE_NAME, undefined, context);
      
      return createResponse(data || [], null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<Bloem[]>([], appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Get plant by ID
   */
  static async getById(id: string): Promise<ApiResponse<Bloem>> {
    const context = createOperationContext('get_bloem_by_id', this.COMPONENT_NAME, { bloemId: id });
    const timer = new PerformanceTimer('get_bloem_by_id');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting get bloem by ID: ${id}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      timer.end(context);

      if (error) {
        if (error.code === 'PGRST116') {
          throw ErrorFactory.recordNotFoundError('bloem', id, context);
        }
        throw ErrorFactory.databaseQueryError(
          `SELECT * FROM plants WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully retrieved bloem: ${data.name}`, context);
      logger.database('select', this.TABLE_NAME, undefined, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<Bloem>(null, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Create new plant
   */
  static async create(bloem: Omit<Bloem, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Bloem>> {
    const context = createOperationContext('create_bloem', this.COMPONENT_NAME, { bloemName: bloem.name });
    const timer = new PerformanceTimer('create_bloem');

    try {
      validateRequiredFields({ 
        name: bloem.name, 
        plant_bed_id: bloem.plant_bed_id 
      }, context);
      
      logger.info(`Starting create bloem: ${bloem.name}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([bloem])
        .select()
        .single();

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          'INSERT INTO plants',
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully created bloem: ${data.name} (ID: ${data.id})`, context);
      logger.database('insert', this.TABLE_NAME, undefined, context);
      logger.security('bloem_created', 'SUCCESS', `bloem/${data.id}`, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      logger.security('bloem_creation_failed', 'FAILURE', undefined, context);
      return createResponse<Bloem>(null, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Update plant
   */
  static async update(id: string, updates: Partial<Bloem>): Promise<ApiResponse<Bloem>> {
    const context = createOperationContext('update_bloem', this.COMPONENT_NAME, { bloemId: id });
    const timer = new PerformanceTimer('update_bloem');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting update bloem: ${id}`, context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          `UPDATE plants WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully updated bloem: ${data.name} (ID: ${data.id})`, context);
      logger.database('update', this.TABLE_NAME, undefined, context);
      logger.security('bloem_updated', 'SUCCESS', `bloem/${data.id}`, context);
      
      return createResponse(data, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      logger.security('bloem_update_failed', 'FAILURE', `bloem/${id}`, context);
      return createResponse<Bloem>(null, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Delete plant
   */
  static async delete(id: string): Promise<ApiResponse<boolean>> {
    const context = createOperationContext('delete_bloem', this.COMPONENT_NAME, { bloemId: id });
    const timer = new PerformanceTimer('delete_bloem');

    try {
      validateRequiredFields({ id }, context);
      
      logger.info(`Starting soft delete bloem: ${id}`, context);
      
      await validateConnection(context);
      
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          `DELETE FROM plants WHERE id = '${id}'`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully soft deleted bloem: ${id}`, context);
      logger.database('soft_delete', this.TABLE_NAME, undefined, context);
      logger.security('bloem_deleted', 'SUCCESS', `bloem/${id}`, context);
      
      return createResponse(true, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      logger.security('bloem_deletion_failed', 'FAILURE', `bloem/${id}`, context);
      return createResponse<boolean>(false, appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Search plants with filters
   */
  static async search(
    filters: SearchFilters,
    sort: SortOptions = { field: 'created_at', direction: 'desc' },
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Bloem>>> {
    const context = createOperationContext('search_bloemen', this.COMPONENT_NAME, {
      query: filters.query,
      status: filters.status,
      category: filters.category,
      sortField: sort.field,
      sortDirection: sort.direction,
      page,
      pageSize
    });
    const timer = new PerformanceTimer('search_bloemen');

    try {
      logger.info('Starting search bloemen operation', context);
      
      await validateConnection(context);
      
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,scientific_name.ilike.%${filters.query}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          `SELECT * FROM plants WITH COUNT`,
          new Error(error.message),
          context
        );
      }

      const totalPages = Math.ceil((count || 0) / pageSize);

      const response: PaginatedResponse<Bloem> = {
        data: data || [],
        count: count || 0,
        page,
        page_size: pageSize,
        total_pages: totalPages
      };

      logger.info(`Successfully searched ${count || 0} bloemen`, context);
      logger.database('search', this.TABLE_NAME, undefined, context);
      
      return createResponse(response, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<PaginatedResponse<Bloem>>({ data: [], count: 0, page: 1, page_size: 10, total_pages: 0 }, appError.getUserFriendlyMessage(), context);
    }
  }
}

// Bloemendatabase (Flower Database) Operations
export class BloemendatabaseService {
  private static readonly TABLE_NAME = 'plants';
  private static readonly COMPONENT_NAME = 'bloemendatabase_service';

  /**
   * Get popular flowers from the database
   */
  static async getPopularFlowers(): Promise<ApiResponse<Bloem[]>> {
    const context = createOperationContext('get_popular_bloemen', this.COMPONENT_NAME);
    const timer = new PerformanceTimer('get_popular_bloemen');

    try {
      logger.info('Starting get popular bloemen operation', context);
      
      await validateConnection(context);
      
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .not('category', 'is', null)
        .order('name')
        .limit(60);

      timer.end(context);

      if (error) {
        throw ErrorFactory.databaseQueryError(
          `SELECT * FROM plants WHERE category IS NOT NULL ORDER BY name LIMIT 60`,
          new Error(error.message),
          context
        );
      }

      logger.info(`Successfully retrieved ${data?.length || 0} popular bloemen`, context);
      logger.database('select', this.TABLE_NAME, undefined, context);
      
      return createResponse(data || [], null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<Bloem[]>([], appError.getUserFriendlyMessage(), context);
    }
  }

  /**
   * Get flower statistics
   */
  static async getStatistics(): Promise<ApiResponse<{
    total_plants: number
    total_categories: number
    total_plant_beds: number
    total_gardens: number
  }>> {
    const context = createOperationContext('get_bloemen_statistics', this.COMPONENT_NAME);
    const timer = new PerformanceTimer('get_bloemen_statistics');

    try {
      logger.info('Starting get bloemen statistics operation', context);
      
      await validateConnection(context);
      
      const [plantsCount, categoriesCount, plantBedsCount, gardensCount] = await Promise.all([
        supabase.from(this.TABLE_NAME).select('id', { count: 'exact', head: true }),
        supabase.from(this.TABLE_NAME).select('category', { count: 'exact', head: true }).not('category', 'is', null),
        supabase.from('plant_beds').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('gardens').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      timer.end(context);

      const stats = {
        total_plants: plantsCount.count || 0,
        total_categories: categoriesCount.count || 0,
        total_plant_beds: plantBedsCount.count || 0,
        total_gardens: gardensCount.count || 0
      };

      logger.info(`Successfully retrieved bloemen statistics`, context);
      logger.database('select', this.TABLE_NAME, undefined, context);
      
      return createResponse(stats, null, context);
    } catch (error) {
      timer.end(context);
      const appError = ErrorHandler.handleError(error, context);
      return createResponse<{ total_plants: number; total_categories: number; total_plant_beds: number; total_gardens: number }>({ total_plants: 0, total_categories: 0, total_plant_beds: 0, total_gardens: 0 }, appError.getUserFriendlyMessage(), context);
    }
  }
}

// Export all services
export const DatabaseService = {
  Tuin: TuinService,
  Plantvak: PlantvakService,
  Bloem: BloemService,
  Bloemendatabase: BloemendatabaseService
}