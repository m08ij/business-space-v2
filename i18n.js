/* =========================================================
   i18n — Arabic / English dictionary + translator
   ========================================================= */
(function (global) {
  'use strict';

  const DICT = {
    ar: {
      /* App */
      app_name: 'تطوير أعمالي',
      tagline: 'إدارة المشاريع المستدامة',

      /* Nav */
      nav_dashboard: 'لوحة التحكم',
      nav_ideas: 'الأفكار',
      nav_projects: 'المشاريع',
      nav_tasks: 'المهام',
      nav_strategy: 'الاستراتيجية',
      nav_impact: 'الأثر والاستدامة',
      nav_sales: 'المبيعات',
      nav_reports: 'التقارير',
      nav_settings: 'الإعدادات',

      /* Common */
      save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل', add: 'إضافة',
      close: 'إغلاق', search: 'بحث…', filter: 'تصفية', all: 'الكل', none: 'لا شيء',
      confirm: 'تأكيد', yes: 'نعم', no: 'لا', back: 'رجوع', next: 'التالي',
      actions: 'إجراءات', status: 'الحالة', priority: 'الأولوية', date: 'التاريخ',
      name: 'الاسم', title: 'العنوان', description: 'الوصف', notes: 'ملاحظات',
      owner: 'المالك', team: 'الفريق', budget: 'الميزانية', progress: 'التقدم',
      start_date: 'تاريخ البداية', end_date: 'تاريخ النهاية', created: 'تاريخ الإنشاء',
      updated: 'تاريخ التحديث', total: 'الإجمالي', value: 'القيمة', count: 'العدد',
      loading: 'جار التحميل…', no_data: 'لا توجد بيانات', optional: 'اختياري',
      required: 'مطلوب', overview: 'نظرة عامة', details: 'التفاصيل', more: 'المزيد',
      export: 'تصدير', import: 'استيراد', reset: 'إعادة تعيين', refresh: 'تحديث',
      archive: 'أرشفة', restore: 'استعادة', duplicate: 'تكرار', view: 'عرض',
      select: 'اختر…', apply: 'تطبيق', clear: 'مسح', done: 'تم', open: 'فتح',
      today: 'اليوم', week: 'أسبوع', month: 'شهر', year: 'سنة',
      high: 'عالية', medium: 'متوسطة', low: 'منخفضة', critical: 'حرجة',

      /* Status */
      status_idea: 'فكرة', status_active: 'نشط', status_planning: 'قيد التخطيط',
      status_on_hold: 'معلّق', status_completed: 'مكتمل', status_cancelled: 'ملغى',
      status_archived: 'مؤرشف', status_draft: 'مسودة', status_review: 'مراجعة',
      status_approved: 'معتمد', status_rejected: 'مرفوض',
      status_todo: 'قائمة', status_in_progress: 'قيد التنفيذ', status_done: 'منتهية',
      status_blocked: 'معطّلة',

      /* Ideas */
      ideas_title: 'الأفكار',
      ideas_sub: 'أنشئ وطوّر أفكار المشاريع',
      new_idea: 'فكرة جديدة',
      edit_idea: 'تعديل الفكرة',
      idea_name: 'اسم الفكرة',
      idea_desc: 'وصف الفكرة',
      idea_rating: 'التقييم',
      idea_category: 'التصنيف',
      convert_to_project: 'تحويل إلى مشروع',
      converted: 'تم التحويل إلى مشروع',
      no_ideas: 'لا توجد أفكار بعد',
      no_ideas_hint: 'ابدأ بإنشاء فكرتك الأولى',
      ideas_archived: 'الأفكار المؤرشفة',
      show_archived: 'عرض المؤرشف',
      rating: 'التقييم',

      /* Projects */
      projects_title: 'المشاريع',
      projects_sub: 'إدارة كاملة لدورة حياة المشروع',
      new_project: 'مشروع جديد',
      edit_project: 'تعديل المشروع',
      project_name: 'اسم المشروع',
      project_desc: 'وصف المشروع',
      no_projects: 'لا توجد مشاريع بعد',
      no_projects_hint: 'أنشئ مشروعك الأول أو حوّل فكرة إلى مشروع',
      stakeholders: 'أصحاب المصلحة',
      goals: 'الأهداف',
      milestones: 'المعالم الزمنية',
      risks: 'المخاطر',
      files: 'الملفات',
      kpis: 'مؤشرات الأداء',
      project_team: 'فريق المشروع',
      delete_project: 'حذف المشروع',
      delete_project_confirm: 'هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع.',
      task_count: 'المهام',
      days_left: 'يوم متبقٍ',
      overdue: 'متأخر',

      /* Tasks */
      tasks_title: 'المهام',
      tasks_sub: 'متابعة جميع المهام عبر المشاريع',
      new_task: 'مهمة جديدة',
      edit_task: 'تعديل المهمة',
      task_title: 'عنوان المهمة',
      task_project: 'المشروع',
      assignee: 'المسؤول',
      due_date: 'تاريخ الاستحقاق',
      no_tasks: 'لا توجد مهام',
      mark_done: 'إتمام',
      mark_todo: 'إعادة إلى القائمة',
      no_project: 'بدون مشروع',

      /* Strategy */
      strategy_title: 'الاستراتيجية',
      strategy_sub: 'SWOT · PESTEL · OKRs',
      swot: 'تحليل SWOT',
      swot_strengths: 'نقاط القوة',
      swot_weaknesses: 'نقاط الضعف',
      swot_opportunities: 'الفرص',
      swot_threats: 'التهديدات',
      add_item: 'إضافة عنصر',
      pestel: 'تحليل PESTEL',
      pestel_political: 'سياسي',
      pestel_economic: 'اقتصادي',
      pestel_social: 'اجتماعي',
      pestel_technological: 'تقني',
      pestel_environmental: 'بيئي',
      pestel_legal: 'قانوني',
      okrs: 'الأهداف والنتائج (OKRs)',
      new_objective: 'هدف جديد',
      objective: 'الهدف',
      key_result: 'نتيجة رئيسية',
      add_kr: 'إضافة نتيجة',
      kr_target: 'المستهدف',
      kr_current: 'الحالي',
      no_okrs: 'لا توجد أهداف',

      /* Impact */
      impact_title: 'الأثر والاستدامة',
      impact_sub: 'SDG · ESG · P5',
      sdg_title: 'أهداف التنمية المستدامة',
      esg_title: 'ESG',
      esg_environmental: 'بيئي',
      esg_social: 'اجتماعي',
      esg_governance: 'حوكمة',
      p5_title: 'إطار P5',
      p5_people: 'الناس',
      p5_planet: 'الكوكب',
      p5_prosperity: 'الازدهار',
      p5_peace: 'السلام',
      p5_partnership: 'الشراكة',
      overall_impact: 'الأثر الإجمالي',
      indicators: 'المؤشرات',

      /* Sales */
      sales_title: 'المبيعات',
      sales_sub: 'خط أنابيب المبيعات',
      new_deal: 'فرصة جديدة',
      edit_deal: 'تعديل الفرصة',
      client: 'العميل',
      deal_value: 'قيمة الصفقة',
      stage: 'المرحلة',
      probability: 'احتمالية الإغلاق',
      expected_close: 'تاريخ الإغلاق المتوقع',
      stage_lead: 'عميل محتمل',
      stage_qualified: 'مؤهل',
      stage_proposal: 'عرض سعر',
      stage_negotiation: 'تفاوض',
      stage_won: 'رابح',
      stage_lost: 'خسارة',
      no_deals: 'لا توجد فرص',
      meddic: 'MEDDIC',
      meddic_metrics: 'المقاييس',
      meddic_metrics_d: 'المشتري الاقتصادي',
      meddic_decision: 'معايير القرار',
      meddic_process: 'عملية القرار',
      meddic_identify: 'تحديد الألم',
      meddic_champion: 'الراعي الداخلي',
      pipeline_value: 'قيمة الأنابيب',
      weighted: 'المرجّح',

      /* Reports */
      reports_title: 'التقارير',
      reports_sub: 'نظرة تحليلية شاملة',
      report_kpis: 'مؤشرات الأداء الرئيسية',
      report_projects: 'المشاريع حسب الحالة',
      report_sales: 'المبيعات حسب المرحلة',
      report_tasks: 'المهام حسب الحالة',
      budget_used: 'الميزانية المستخدمة',

      /* Settings */
      settings_title: 'الإعدادات',
      settings_sub: 'التفضيلات والبيانات',
      language: 'اللغة',
      theme: 'المظهر',
      theme_light: 'فاتح',
      theme_dark: 'داكن',
      data_management: 'إدارة البيانات',
      export_data: 'تصدير البيانات',
      import_data: 'استيراد البيانات',
      reset_data: 'إعادة تعيين البيانات',
      reset_confirm: 'سيتم حذف جميع البيانات نهائيًا. هل أنت متأكد؟',
      supabase_config: 'إعدادات Supabase',
      supabase_url: 'رابط المشروع (URL)',
      supabase_key: 'المفتاح العام (anon key)',
      connect: 'اتصال', disconnect: 'فصل',
      connected: 'متصل', not_connected: 'غير متصل',
      sync_now: 'مزامنة الآن',
      sign_in: 'تسجيل الدخول',
      sign_up: 'إنشاء حساب',
      sign_out: 'تسجيل الخروج',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',

      /* Messages */
      msg_saved: 'تم الحفظ بنجاح',
      msg_deleted: 'تم الحذف',
      msg_created: 'تم الإنشاء',
      msg_updated: 'تم التحديث',
      msg_archived: 'تم الأرشفة',
      msg_restored: 'تم الاستعادة',
      msg_error: 'حدث خطأ',
      msg_offline: 'أنت غير متصل — سيتم الحفظ محليًا',
      msg_online: 'متصل',
      msg_local_mode: 'محلي',
      msg_synced: 'تمت المزامنة',
      msg_syncing: 'جار المزامنة…',
      msg_sync_error: 'فشل المزامنة',
      msg_confirm_delete: 'تأكيد الحذف؟',
      msg_exported: 'تم تصدير البيانات',
      msg_imported: 'تم استيراد البيانات',
      msg_reset: 'تمت إعادة التعيين',
      msg_login_success: 'تم تسجيل الدخول',
      msg_logout: 'تم تسجيل الخروج',
      msg_no_supabase: 'أدخل رابط ومفتاح Supabase أولاً',
      msg_invalid_email: 'بريد إلكتروني غير صالح',

      /* Misc */
      days: 'يوم', hours: 'ساعة', minutes: 'دقيقة',
      kr_unit: 'وحدة',
      of: 'من',
      all_projects: 'جميع المشاريع',
      add_note: 'إضافة ملاحظة',
      upload_file: 'رفع ملف',
      confirm_delete_title: 'تأكيد الحذف',
      confirm_delete_body: 'لا يمكن التراجع عن هذا الإجراء.',
      delete_kr_confirm: 'حذف هذه النتيجة؟',
      delete_item_confirm: 'حذف هذا العنصر؟'
    },

    en: {
      /* App */
      app_name: 'Business Development',
      tagline: 'Sustainable Project Management',

      /* Nav */
      nav_dashboard: 'Dashboard',
      nav_ideas: 'Ideas',
      nav_projects: 'Projects',
      nav_tasks: 'Tasks',
      nav_strategy: 'Strategy',
      nav_impact: 'Impact & Sustainability',
      nav_sales: 'Sales',
      nav_reports: 'Reports',
      nav_settings: 'Settings',

      /* Common */
      save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', add: 'Add',
      close: 'Close', search: 'Search…', filter: 'Filter', all: 'All', none: 'None',
      confirm: 'Confirm', yes: 'Yes', no: 'No', back: 'Back', next: 'Next',
      actions: 'Actions', status: 'Status', priority: 'Priority', date: 'Date',
      name: 'Name', title: 'Title', description: 'Description', notes: 'Notes',
      owner: 'Owner', team: 'Team', budget: 'Budget', progress: 'Progress',
      start_date: 'Start Date', end_date: 'End Date', created: 'Created',
      updated: 'Updated', total: 'Total', value: 'Value', count: 'Count',
      loading: 'Loading…', no_data: 'No data', optional: 'optional',
      required: 'required', overview: 'Overview', details: 'Details', more: 'More',
      export: 'Export', import: 'Import', reset: 'Reset', refresh: 'Refresh',
      archive: 'Archive', restore: 'Restore', duplicate: 'Duplicate', view: 'View',
      select: 'Select…', apply: 'Apply', clear: 'Clear', done: 'Done', open: 'Open',
      today: 'Today', week: 'Week', month: 'Month', year: 'Year',
      high: 'High', medium: 'Medium', low: 'Low', critical: 'Critical',

      /* Status */
      status_idea: 'Idea', status_active: 'Active', status_planning: 'Planning',
      status_on_hold: 'On Hold', status_completed: 'Completed', status_cancelled: 'Cancelled',
      status_archived: 'Archived', status_draft: 'Draft', status_review: 'Review',
      status_approved: 'Approved', status_rejected: 'Rejected',
      status_todo: 'To Do', status_in_progress: 'In Progress', status_done: 'Done',
      status_blocked: 'Blocked',

      /* Ideas */
      ideas_title: 'Ideas',
      ideas_sub: 'Create and develop project ideas',
      new_idea: 'New Idea',
      edit_idea: 'Edit Idea',
      idea_name: 'Idea Name',
      idea_desc: 'Idea Description',
      idea_rating: 'Rating',
      idea_category: 'Category',
      convert_to_project: 'Convert to Project',
      converted: 'Converted to project',
      no_ideas: 'No ideas yet',
      no_ideas_hint: 'Start by creating your first idea',
      ideas_archived: 'Archived Ideas',
      show_archived: 'Show archived',
      rating: 'Rating',

      /* Projects */
      projects_title: 'Projects',
      projects_sub: 'Full project lifecycle management',
      new_project: 'New Project',
      edit_project: 'Edit Project',
      project_name: 'Project Name',
      project_desc: 'Project Description',
      no_projects: 'No projects yet',
      no_projects_hint: 'Create your first project or convert an idea',
      stakeholders: 'Stakeholders',
      goals: 'Goals',
      milestones: 'Milestones',
      risks: 'Risks',
      files: 'Files',
      kpis: 'KPIs',
      project_team: 'Project Team',
      delete_project: 'Delete Project',
      delete_project_confirm: 'Are you sure? This cannot be undone.',
      task_count: 'Tasks',
      days_left: 'days left',
      overdue: 'Overdue',

      /* Tasks */
      tasks_title: 'Tasks',
      tasks_sub: 'Track all tasks across projects',
      new_task: 'New Task',
      edit_task: 'Edit Task',
      task_title: 'Task Title',
      task_project: 'Project',
      assignee: 'Assignee',
      due_date: 'Due Date',
      no_tasks: 'No tasks',
      mark_done: 'Mark Done',
      mark_todo: 'Move to To Do',
      no_project: 'No Project',

      /* Strategy */
      strategy_title: 'Strategy',
      strategy_sub: 'SWOT · PESTEL · OKRs',
      swot: 'SWOT Analysis',
      swot_strengths: 'Strengths',
      swot_weaknesses: 'Weaknesses',
      swot_opportunities: 'Opportunities',
      swot_threats: 'Threats',
      add_item: 'Add item',
      pestel: 'PESTEL Analysis',
      pestel_political: 'Political',
      pestel_economic: 'Economic',
      pestel_social: 'Social',
      pestel_technological: 'Technological',
      pestel_environmental: 'Environmental',
      pestel_legal: 'Legal',
      okrs: 'Objectives & Key Results',
      new_objective: 'New Objective',
      objective: 'Objective',
      key_result: 'Key Result',
      add_kr: 'Add Key Result',
      kr_target: 'Target',
      kr_current: 'Current',
      no_okrs: 'No objectives',

      /* Impact */
      impact_title: 'Impact & Sustainability',
      impact_sub: 'SDG · ESG · P5',
      sdg_title: 'Sustainable Development Goals',
      esg_title: 'ESG',
      esg_environmental: 'Environmental',
      esg_social: 'Social',
      esg_governance: 'Governance',
      p5_title: 'P5 Framework',
      p5_people: 'People',
      p5_planet: 'Planet',
      p5_prosperity: 'Prosperity',
      p5_peace: 'Peace',
      p5_partnership: 'Partnership',
      overall_impact: 'Overall Impact',
      indicators: 'Indicators',

      /* Sales */
      sales_title: 'Sales',
      sales_sub: 'Sales Pipeline',
      new_deal: 'New Deal',
      edit_deal: 'Edit Deal',
      client: 'Client',
      deal_value: 'Deal Value',
      stage: 'Stage',
      probability: 'Close Probability',
      expected_close: 'Expected Close',
      stage_lead: 'Lead',
      stage_qualified: 'Qualified',
      stage_proposal: 'Proposal',
      stage_negotiation: 'Negotiation',
      stage_won: 'Won',
      stage_lost: 'Lost',
      no_deals: 'No deals',
      meddic: 'MEDDIC',
      meddic_metrics: 'Metrics',
      meddic_metrics_d: 'Economic Buyer',
      meddic_decision: 'Decision Criteria',
      meddic_process: 'Decision Process',
      meddic_identify: 'Identify Pain',
      meddic_champion: 'Champion',
      pipeline_value: 'Pipeline Value',
      weighted: 'Weighted',

      /* Reports */
      reports_title: 'Reports',
      reports_sub: 'Comprehensive analytics',
      report_kpis: 'Key Performance Indicators',
      report_projects: 'Projects by Status',
      report_sales: 'Sales by Stage',
      report_tasks: 'Tasks by Status',
      budget_used: 'Budget Used',

      /* Settings */
      settings_title: 'Settings',
      settings_sub: 'Preferences & Data',
      language: 'Language',
      theme: 'Theme',
      theme_light: 'Light',
      theme_dark: 'Dark',
      data_management: 'Data Management',
      export_data: 'Export Data',
      import_data: 'Import Data',
      reset_data: 'Reset Data',
      reset_confirm: 'All data will be permanently deleted. Are you sure?',
      supabase_config: 'Supabase Configuration',
      supabase_url: 'Project URL',
      supabase_key: 'Anon Public Key',
      connect: 'Connect', disconnect: 'Disconnect',
      connected: 'Connected', not_connected: 'Not connected',
      sync_now: 'Sync Now',
      sign_in: 'Sign In',
      sign_up: 'Sign Up',
      sign_out: 'Sign Out',
      email: 'Email',
      password: 'Password',

      /* Messages */
      msg_saved: 'Saved successfully',
      msg_deleted: 'Deleted',
      msg_created: 'Created',
      msg_updated: 'Updated',
      msg_archived: 'Archived',
      msg_restored: 'Restored',
      msg_error: 'An error occurred',
      msg_offline: 'You are offline — data saved locally',
      msg_online: 'Online',
      msg_local_mode: 'Local',
      msg_synced: 'Synced',
      msg_syncing: 'Syncing…',
      msg_sync_error: 'Sync failed',
      msg_confirm_delete: 'Confirm delete?',
      msg_exported: 'Data exported',
      msg_imported: 'Data imported',
      msg_reset: 'Data reset',
      msg_login_success: 'Signed in',
      msg_logout: 'Signed out',
      msg_no_supabase: 'Enter Supabase URL and key first',
      msg_invalid_email: 'Invalid email',

      /* Misc */
      days: 'days', hours: 'hours', minutes: 'minutes',
      kr_unit: 'unit',
      of: 'of',
      all_projects: 'All Projects',
      add_note: 'Add note',
      upload_file: 'Upload file',
      confirm_delete_title: 'Confirm Delete',
      confirm_delete_body: 'This action cannot be undone.',
      delete_kr_confirm: 'Delete this key result?',
      delete_item_confirm: 'Delete this item?'
    }
  };

  /* SDG names */
  const SDG = {
    ar: [
      'القضاء على الفقر', 'القضاء على الجوع', 'الصحة الجيدة', 'التعليم الجيد',
      'المساواة بين الجنسين', 'المياه النظيفة', 'طاقة نظيفة', 'عمل لائق',
      'الصناعة والابتكار', 'تقليل الفوارق', 'مدن مستدامة', 'استهلاك مسؤول',
      'العمل المناخي', 'الحياة تحت الماء', 'الحياة على البر', 'السلام والعدل',
      'الشراكات'
    ],
    en: [
      'No Poverty', 'Zero Hunger', 'Good Health', 'Quality Education',
      'Gender Equality', 'Clean Water', 'Clean Energy', 'Decent Work',
      'Industry & Innovation', 'Reduced Inequalities', 'Sustainable Cities',
      'Responsible Consumption', 'Climate Action', 'Life Below Water',
      'Life on Land', 'Peace & Justice', 'Partnerships'
    ]
  };

  const state = { lang: 'ar' };

  function t(key, fallback) {
    const dict = DICT[state.lang] || DICT.ar;
    return dict[key] || DICT.ar[key] || fallback || key;
  }

  function setLang(lang) {
    state.lang = (lang === 'en') ? 'en' : 'ar';
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    return state.lang;
  }

  function getLang() { return state.lang; }

  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const attr = el.dataset.i18nAttr;
      const text = t(key);
      if (attr) el.setAttribute(attr, text);
      else el.textContent = text;
    });
    scope.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    scope.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.dataset.i18nTitle);
    });
  }

  function sdgName(n) {
    return (SDG[state.lang] || SDG.ar)[n - 1] || ('SDG ' + n);
  }

  global.I18n = { t, setLang, getLang, apply, sdgName, DICT, SDG };
})(window);