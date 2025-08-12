import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SupabaseService {

    public supabase: SupabaseClient = createClient(environment.supabase.supabase_url, environment.supabase.supabase_service_role_key);

    public getData(table: string, select?: string): any {
        return this.supabase.from(table).select(select || '*');
    }

    public insertData(table: string, data: any): any {
        return this.supabase.from(table).insert([data]);
    }

    public removeData(table: string, id: string): any {
        return this.supabase.from(table).delete().eq('id', id);
    }
}
