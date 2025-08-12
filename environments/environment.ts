// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  supabase: {
    postgres_url: 'postgres://postgres.iglsgcsbsyafxrhhyuxb:J5XWCC0tf8KAeSy1@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x',
    postgres_user: 'postgres',
    postgres_host: 'db.iglsgcsbsyafxrhhyuxb.supabase.co',
    supabase_jwt_secret: 'XUg7syobvGVBzzQ5tJwkmg5w/XAPxWibvNi8HobHirEB5oFujLWAOTcc2dQ+0b+/s9cUdrGm2ZFc6DUsH8Ax/w==',
    next_public_supabase_anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbHNnY3Nic3lhZnhyaGh5dXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTM2MzUsImV4cCI6MjA3MDIyOTYzNX0.R-zjBHDtI762fZh60mp15Kn-oB-q6z2BraY_84tCGD',
    postgres_prisma_url: 'postgres://postgres.iglsgcsbsyafxrhhyuxb:J5XWCC0tf8KAeSy1@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
    postgres_password: 'J5XWCC0tf8KAeSy1',
    postgres_database: 'postgres',
    supabase_url:'https://iglsgcsbsyafxrhhyuxb.supabase.co',
    next_public_supabase_url:'https://iglsgcsbsyafxrhhyuxb.supabase.co',
    supabase_service_role_key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbHNnY3Nic3lhZnhyaGh5dXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY1MzYzNSwiZXhwIjoyMDcwMjI5NjM1fQ.pZTLtxvCMhEGlODk8l99yt1K69_NH0HP9QNeL31ujKw',
    postgres_url_non_pooling:'postgres://postgres.iglsgcsbsyafxrhhyuxb:J5XWCC0tf8KAeSy1@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require'
  },
  google: {
    client_id: '711336051675-tq12er9u243tjf89g7im2pi4ou42qlio.apps.googleusercontent.com'
  },
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
