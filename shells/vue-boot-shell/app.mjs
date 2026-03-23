import { createApp, ref } from 'https://cdn.jsdelivr.net/npm/vue@3.4.38/dist/vue.esm-browser.prod.min.js';
import HomeNavbar from '../../components/home-navbar.mjs'
import TemplateExecute from '../components/template-execute.mjs';

export const app = createApp({
  data()
  {
    return {
      selectedTemplate:'',
      templates:[],
      templateText:'',
      templateExecuteControl: null,
      settingsName: 'rpg-code-maker',
      servicesPath: './services.php',
      sqlServicesPath: '../sql/sql-services.php',
      envDir: '222',
    };
  },

  components: { HomeNavbar, TemplateExecute },

  mounted: async function ()
  {
    this.settings_recall( ) ; 
    await this.getEnvDir( ) ;
    await this.templates_load( ) ;
    if ( this.selectedTemplate)
      await this.templateText_load( ) ;
  },

  watch: {
    selectedTemplate:  async function ( newValue, oldValue )
    {
      this.settings_store( ) ;
      if ( this.selectedTemplate)
        await this.templateText_load( ) ;
    }
  },

  methods:
  {
    async getEnvDir( )
    {
      let errmsg = '';
      const url = this.sqlServicesPath;
      const params = {
        action: 'getEnvDir'
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      const rv = await response.json();
      this.envDir = rv.envDir ;
    },

    settings_store()
    {
      const settings = {
        selectedTemplate: this.selectedTemplate,
      };
      localStorage.setItem(this.settingsName, JSON.stringify(settings));
    },

    settings_recall()
    {
      const text = localStorage.getItem(this.settingsName);
      if (text)
      {
        const settings = JSON.parse(text);
        {
          this.selectedTemplate = settings.selectedTemplate || '';
        }
      }
    },

    async templates_load()
    {
      let errmsg = '';
      const url = this.servicesPath;
      const params = {
        action: 'templates_select'
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      const rv = await response.json();
      this.templates = rv.files;
    },

    async templateText_load( )
    {
      this.templateText = '';
      if ( this.selectedTemplate)
      {
        // fetch services template_select
        let errmsg = '';
        const url = this.servicesPath;
        const params = {
          action: 'template_select',
          templateName: this.selectedTemplate
        };
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        });
        const rv = await response.json();
        this.templateText = rv.templateText;
      }
    },

  },
});
