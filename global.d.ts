declare global {
  namespace globalThis {
    var testUtils: {
      mockGarden: {
        id: string;
        name: string;
        description: string;
        location: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      mockPlantBed: {
        id: string;
        garden_id: string;
        name: string;
        location: string;
        size: string;
        soil_type: string;
        sun_exposure: string;
        description: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      mockPlant: {
        id: string;
        plant_bed_id: string;
        name: string;
        scientific_name: string;
        variety: string;
        color: string;
        height: number;
        status: string;
        created_at: string;
        updated_at: string;
      };
    };
  }
}

export {};