/* =========================================================
   Views — all page renderers
   ========================================================= */
(function (global) {
  'use strict';

  const S = () => global.Store;
  const U = () => global.UI;
  const T = (k, f) => I18n.t(k, f);
  const { el, esc } = UI;

  /* ============================================================
     DASHBOARD
     ============================================================ */
  function dashboard() {
    const projects = S().list('projects').filter(p => !p.archived);
    const tasks = S().list('tasks');
    const ideas = S().list('ideas').filter(i => !i.archived);
    const deals = S().list('deals');
    const openTasks = tasks.filter(t => t.status !== 'done');
    const doneTasks = tasks.filter(t => t.status === 'done');
    const pipelineValue = deals
      .filter(d => d.stage !== 'lost')
      .reduce((s, d) => s + (Number(d.value) || 0), 0);
    const weighted = deals
      .filter(d => d.stage !== 'lost')
      .reduce((s, d) => s + (Number(d.value) || 0) * ((Number(d.probability) || 0) / 100), 0);
    const totalBudget = projects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
    const usedBudget = projects.reduce((s, p) => s + (Number(p.budget_used) || 0), 0);
    const activeCount = projects.filter(p => p.status === 'active').length;

    const upcoming = tasks
      .filter(t => t.status !== 'done' && t.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);

    const recent = projects.slice(0, 4);

    const wrap = el('div', { class: 'col', style: 'gap:22px' });

    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('h1', { class: 'page-title', text: T('nav_dashboard') }),
        el('p', { class: 'page-sub', text: T('tagline') })
      ]),
      el('div', { class: 'page-actions' }, [
        el('button', {
          class: 'btn btn-soft', onclick: () => location.hash = '#/ideas',
          html: svgPlus() + '<span>' + T('new_idea') + '</span>'
        }),
        el('button', {
          class: 'btn btn-primary', onclick: () => location.hash = '#/projects',
          html: svgPlus() + '<span>' + T('new_project') + '</span>'
        })
      ])
    ]));

    /* Stats grid */
    const stats = el('div', { class: 'grid grid-4' });
    stats.appendChild(stat(T('nav_projects'), projects.length,
      T('status_active') + ': ' + activeCount, 'primary', svgFolder()));
    stats.appendChild(stat(T('nav_tasks'), openTasks.length,
      T('status_done') + ': ' + doneTasks.length, 'info', svgCheck()));
    stats.appendChild(stat(T('nav_ideas'), ideas.length,
      T('nav_ideas'), 'purple', svgBulb()));
    stats.appendChild(stat(T('pipeline_value'), UI.fmtMoney(pipelineValue),
      T('weighted') + ': ' + UI.fmtMoney(weighted), 'success', svgChart()));
    wrap.appendChild(stats);

    /* Budget + Impact row */
    const budgetPct = totalBudget ? Math.round((usedBudget / totalBudget) * 100) : 0;
    const row2 = el('div', { class: 'grid grid-2' });

    const budgetCard = el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [
        el('div', { class: 'grow' }, [
          el('div', { class: 'card-title', text: T('budget') }),
          el('div', { class: 'card-sub', text: T('budget_used') })
        ]),
        el('span', { class: 'badge ' + UI.progressClass(budgetPct), text: budgetPct + '%' })
      ]),
      el('div', { class: 'card-body' }, [
        el('div', { class: 'row', style: 'justify-content:space-between;margin-bottom:8px' }, [
          el('strong', { class: 'text-lg', text: UI.fmtMoney(usedBudget) }),
          el('span', { class: 'muted text-sm', text: '/ ' + UI.fmtMoney(totalBudget) })
        ]),
        el('div', { class: 'progress ' + UI.progressClass(budgetPct) }, [
          el('i', { style: `width:${Math.min(budgetPct, 100)}%` })
        ])
      ])
    ]);
    row2.appendChild(budgetCard);

    const impactCard = el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [
        el('div', { class: 'grow' }, [
          el('div', { class: 'card-title', text: T('nav_impact') }),
          el('div', { class: 'card-sub', text: T('overall_impact') })
        ]),
        el('span', { class: 'badge primary', text: 'P5' })
      ]),
      el('div', { class: 'card-body' }, impactBars())
    ]);
    row2.appendChild(impactCard);
    wrap.appendChild(row2);

    /* Upcoming + Recent */
    const row3 = el('div', { class: 'grid grid-2' });

    const upCard = el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [
        el('div', { class: 'grow' }, [el('div', { class: 'card-title', text: T('due_date') })])
      ])
    ]);
    if (upcoming.length) {
      const list = el('div', { class: 'list' });
      upcoming.forEach(t => {
        const overdue = t.due_date && new Date(t.due_date) < new Date();
        list.appendChild(el('div', { class: 'list-item' }, [
          el('div', {
            class: 'avatar sm',
            text: UI.initials(t.assignee || t.title)
          }),
          el('div', { class: 'grow' }, [
            el('div', { class: 'title', text: t.title }),
            el('div', { class: 'meta', text: UI.fmtDate(t.due_date) })
          ]),
          el('span', {
            class: 'badge ' + (overdue ? 'danger' : 'info'),
            text: overdue ? T('overdue') : T('status_' + (t.status || 'todo'))
          })
        ]));
      });
      upCard.appendChild(list);
    } else {
      upCard.appendChild(empty('no_tasks', 'no_tasks'));
    }
    row3.appendChild(upCard);

    const recCard = el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [
        el('div', { class: 'grow' }, [el('div', { class: 'card-title', text: T('nav_projects') })])
      ])
    ]);
    if (recent.length) {
      const list = el('div', { class: 'list' });
      recent.forEach(p => {
        const tp = progressOfProject(p);
        list.appendChild(el('div', {
          class: 'list-item', style: 'cursor:pointer',
          onclick: () => location.hash = '#/projects/' + p.id
        }, [
          el('div', { class: 'grow' }, [
            el('div', { class: 'title', text: p.name || '—' }),
            el('div', { class: 'meta', text: (p.owner || '—') })
          ]),
          el('span', { class: 'badge ' + UI.statusTone(p.status), text: UI.statusLabel(p.status || 'planning') }),
          el('div', { style: 'width:70px' }, [
            el('div', { class: 'progress thin' }, [el('i', { style: `width:${tp}%` })])
          ])
        ]));
      });
      recCard.appendChild(list);
    } else {
      recCard.appendChild(empty('no_projects', 'no_projects_hint'));
    }
    row3.appendChild(recCard);
    wrap.appendChild(row3);

    return wrap;
  }

  function progressOfProject(p) {
    const tasks = S().list('tasks', t => t.project_id === p.id);
    if (!tasks.length) return p.progress || 0;
    const done = tasks.filter(t => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
  }

  function stat(label, value, hint, tone, icon) {
    return el('div', { class: 'stat is-' + (tone || 'primary') }, [
      el('div', { class: 'stat-top' }, [
        el('span', { class: 'stat-label', text: label }),
        el('span', { class: 'stat-icon', html: icon })
      ]),
      el('div', { class: 'stat-value', text: value }),
      el('div', { class: 'stat-hint', text: hint || '' })
    ]);
  }

  function impactBars() {
    const p5 = S().list('p5');
    const esg = S().list('esg');
    const row = (label, val, tone) => el('div', { class: 'esg-row' }, [
      el('span', { class: 'text-sm fw-6', text: label }),
      el('div', { class: 'progress ' + (tone || '') }, [el('i', { style: `width:${val}%` })]),
      el('span', { class: 'val', text: val + '%' })
    ]);
    const avg = (arr) => arr.length ? Math.round(arr.reduce((s, x) => s + (Number(x.score) || 0), 0) / arr.length) : 0;
    const p5avg = avg(p5);
    const esgAvg = avg(esg);
    return el('div', { class: 'col', style: 'gap:4px' }, [
      row(T('p5_title'), p5avg, UI.progressClass(p5avg)),
      row(T('esg_title'), esgAvg, UI.progressClass(esgAvg)),
      row(T('sdg_title'), Math.min(100, S().list('sdg').length * 6), 'info')
    ]);
  }

  /* ============================================================
     IDEAS
     ============================================================ */
  function ideas() {
    const showArchived = state.ideasArchived;
    const all = S().list('ideas');
    const items = all.filter(i => (showArchived ? i.archived : !i.archived));

    const wrap = el('div', { class: 'col', style: 'gap:20px' });
    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('h1', { class: 'page-title', text: T('ideas_title') }),
        el('p', { class: 'page-sub', text: T('ideas_sub') })
      ]),
      el('div', { class: 'page-actions' }, [
        el('label', { class: 'check' }, [
          el('input', {
            type: 'checkbox', checked: showArchived,
            onchange: (e) => { state.ideasArchived = e.target.checked; render(); }
          }),
          el('span', { text: T('show_archived') })
        ]),
        el('button', {
          class: 'btn btn-primary', onclick: () => ideaForm(),
          html: svgPlus() + '<span>' + T('new_idea') + '</span>'
        })
      ])
    ]));

    if (!items.length) {
      wrap.appendChild(empty('no_ideas', 'no_ideas_hint'));
      return wrap;
    }

    const grid = el('div', { class: 'grid grid-auto' });
    items.forEach(i => {
      const card = el('div', { class: 'card hoverable' }, [
        el('div', { class: 'card-head' }, [
          el('div', { class: 'grow' }, [
            el('div', { class: 'card-title ellipsis', text: i.name || '—' }),
            el('div', { class: 'card-sub', text: i.category || T('nav_ideas') })
          ]),
          el('span', {
            class: 'badge ' + UI.statusTone(i.status || 'idea'),
            text: UI.statusLabel(i.status || 'idea')
          })
        ]),
        el('div', { class: 'card-body' }, [
          el('p', { class: 'text-sm clamp-2 text-2', text: i.description || '—' })
        ]),
        el('div', { class: 'card-foot' }, [
          el('span', { class: 'prio ' + (i.priority || 'medium'), text: UI.prioLabel(i.priority || 'medium') }),
          el('div', { class: 'spacer' }),
          el('span', { class: 'muted text-xs', text: '★ ' + (i.rating || 0) + '/5' })
        ]),
        el('div', { class: 'card-foot', style: 'gap:6px' }, [
          el('button', {
            class: 'btn btn-sm btn-soft', text: T('convert_to_project'),
            onclick: () => convertIdea(i)
          }),
          el('div', { class: 'spacer' }),
          el('button', { class: 'icon-btn', onclick: () => ideaForm(i), html: svgEdit(), title: T('edit') }),
          el('button', {
            class: 'icon-btn', onclick: () => toggleArchive('ideas', i),
            html: i.archived ? svgRestore() : svgArchive(),
            title: i.archived ? T('restore') : T('archive')
          }),
          el('button', { class: 'icon-btn', onclick: () => deleteEntity('ideas', i), html: svgTrash(), title: T('delete') })
        ])
      ]);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  function ideaForm(idea) {
    const isEdit = !!idea;
    const d = idea || { status: 'idea', priority: 'medium', rating: 3 };
    const body = el('div', { class: 'form-grid' }, [
      field(T('idea_name'), input('name', d.name, { required: true }), 'span-2'),
      field(T('idea_desc'), textarea('description', d.description), 'span-full'),
      field(T('status'), select('status', d.status, ['idea', 'draft', 'review', 'approved'])),
      field(T('priority'), select('priority', d.priority, ['low', 'medium', 'high', 'critical'])),
      field(T('idea_category'), input('category', d.category)),
      field(T('rating'), rangeInput('rating', d.rating, 1, 5))
    ]);
    const form = el('form', { id: 'entityForm' }, [body]);
    const footer = el('div', { class: 'row', style: 'width:100%' }, [
      el('div', { class: 'spacer' }),
      el('button', { class: 'btn btn-ghost', text: T('cancel'), onclick: UI.closeModal }),
      el('button', {
        class: 'btn btn-primary', text: T('save'),
        onclick: () => {
          const data = collect(form);
          if (!data.name) { UI.toast(T('required') + ': ' + T('idea_name'), 'warn'); return; }
          if (isEdit) { S().update('ideas', idea.id, data); UI.toast(T('msg_updated'), 'success'); }
          else { S().create('ideas', data); UI.toast(T('msg_created'), 'success'); }
          UI.closeModal(); render();
        }
      })
    ]);
    UI.openModal({ title: isEdit ? T('edit_idea') : T('new_idea'), body: form, footer });
  }

  function convertIdea(idea) {
    const project = S().create('projects', {
      name: idea.name, description: idea.description,
      status: 'planning', priority: idea.priority || 'medium',
      budget: 0, budget_used: 0, owner: '', team: [],
      stakeholders: [], goals: [], start_date: UI.todayISO(),
      end_date: '', source_idea_id: idea.id
    });
    S().update('ideas', idea.id, { status: 'approved', converted_project_id: project.id });
    UI.toast(T('converted'), 'success');
    render();
  }

  /* ============================================================
     PROJECTS
     ============================================================ */
  function projects() {
    const all = S().list('projects').filter(p => !p.archived);
    const wrap = el('div', { class: 'col', style: 'gap:20px' });
    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('h1', { class: 'page-title', text: T('projects_title') }),
        el('p', { class: 'page-sub', text: T('projects_sub') })
      ]),
      el('div', { class: 'page-actions' }, [
        el('button', {
          class: 'btn btn-primary', onclick: () => projectForm(),
          html: svgPlus() + '<span>' + T('new_project') + '</span>'
        })
      ])
    ]));

    if (!all.length) {
      wrap.appendChild(empty('no_projects', 'no_projects_hint'));
      return wrap;
    }

    const grid = el('div', { class: 'grid grid-auto' });
    all.forEach(p => {
      const pct = progressOfProject(p);
      const taskCount = S().list('tasks', t => t.project_id === p.id).length;
      const card = el('div', {
        class: 'card hoverable',
        style: 'cursor:pointer',
        onclick: (e) => {
          if (e.target.closest('button')) return;
          location.hash = '#/projects/' + p.id;
        }
      }, [
        el('div', { class: 'card-head' }, [
          el('div', { class: 'grow' }, [
            el('div', { class: 'card-title ellipsis', text: p.name || '—' }),
            el('div', { class: 'card-sub', text: p.owner || T('no_project') })
          ]),
          el('span', {
            class: 'badge ' + UI.statusTone(p.status || 'planning'),
            text: UI.statusLabel(p.status || 'planning')
          })
        ]),
        el('div', { class: 'card-body' }, [
          el('p', { class: 'text-sm clamp-2 text-2', text: p.description || '—' }),
          el('div', { class: 'progress-line mt-3' }, [
            el('div', { class: 'progress ' + UI.progressClass(pct) }, [el('i', { style: `width:${pct}%` })]),
            el('span', { class: 'val', text: pct + '%' })
          ])
        ]),
        el('div', { class: 'card-foot' }, [
          el('span', { class: 'prio ' + (p.priority || 'medium'), text: UI.prioLabel(p.priority || 'medium') }),
          el('div', { class: 'spacer' }),
          el('span', { class: 'muted text-xs', text: taskCount + ' ' + T('task_count') }),
          el('span', { class: 'muted text-xs', text: UI.fmtMoney(p.budget || 0) })
        ])
      ]);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  function projectForm(project) {
    const isEdit = !!project;
    const d = project || { status: 'planning', priority: 'medium', start_date: UI.todayISO() };
    const body = el('div', { class: 'form-grid' }, [
      field(T('project_name'), input('name', d.name, { required: true }), 'span-2'),
      field(T('project_desc'), textarea('description', d.description), 'span-full'),
      field(T('status'), select('status', d.status, ['planning', 'active', 'on_hold', 'completed', 'cancelled'])),
      field(T('priority'), select('priority', d.priority, ['low', 'medium', 'high', 'critical'])),
      field(T('owner'), input('owner', d.owner)),
      field(T('budget'), input('budget', d.budget, { type: 'number', min: 0 })),
      field(T('start_date'), input('start_date', d.start_date, { type: 'date' })),
      field(T('end_date'), input('end_date', d.end_date, { type: 'date' }))
    ]);
    const form = el('form', {}, [body]);
    const footer = el('div', { class: 'row', style: 'width:100%' }, [
      el('div', { class: 'spacer' }),
      el('button', { class: 'btn btn-ghost', text: T('cancel'), onclick: UI.closeModal }),
      el('button', {
        class: 'btn btn-primary', text: T('save'),
        onclick: () => {
          const data = collect(form);
          if (!data.name) { UI.toast(T('required'), 'warn'); return; }
          data.budget = Number(data.budget) || 0;
          if (isEdit) { S().update('projects', project.id, data); UI.toast(T('msg_updated'), 'success'); }
          else { S().create('projects', data); UI.toast(T('msg_created'), 'success'); }
          UI.closeModal(); render();
        }
      })
    ]);
    UI.openModal({ title: isEdit ? T('edit_project') : T('new_project'), body: form, footer, wide: true });
  }

  /* ============================================================
     PROJECT DETAIL
     ============================================================ */
  function projectDetail(id) {
    const p = S().get('projects', id);
    if (!p) return notFound();
    const tab = state.projectTab || 'overview';
    const wrap = el('div', { class: 'col', style: 'gap:18px' });

    wrap.appendChild(el('div', { class: 'row' }, [
      el('button', {
        class: 'btn btn-ghost btn-sm',
        html: svgBack() + '<span>' + T('back') + '</span>',
        onclick: () => location.hash = '#/projects'
      })
    ]));

    const pct = progressOfProject(p);
    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('div', { class: 'row tight' }, [
          el('h1', { class: 'page-title', text: p.name || '—' }),
          el('span', {
            class: 'badge ' + UI.statusTone(p.status || 'planning'),
            text: UI.statusLabel(p.status || 'planning')
          })
        ]),
        el('p', { class: 'page-sub', text: p.description || '' })
      ]),
      el('div', { class: 'page-actions' }, [
        el('button', { class: 'btn btn-ghost btn-sm', onclick: () => projectForm(p), html: svgEdit() + '<span>' + T('edit') + '</span>' }),
        el('button', {
          class: 'btn btn-ghost btn-sm', html: svgArchive() + '<span>' + T('archive') + '</span>',
          onclick: () => toggleArchive('projects', p)
        }),
        el('button', {
          class: 'btn btn-danger btn-sm', html: svgTrash() + '<span>' + T('delete') + '</span>',
          onclick: () => deleteEntity('projects', p)
        })
      ])
    ]));

    const tabs = el('div', { class: 'tabs' });
    [['overview', 'overview', svgInfo()], ['tasks', 'nav_tasks', svgCheck()],
     ['risks', 'risks', svgWarn()], ['milestones', 'milestones', svgFlag()],
     ['impact', 'nav_impact', svgLeaf()], ['notes', 'notes', svgNote()]]
    .forEach(([key, labelKey, icon]) => {
      tabs.appendChild(el('button', {
        class: 'tab' + (tab === key ? ' active' : ''),
        onclick: () => { state.projectTab = key; render(); },
        html: icon + '<span>' + T(labelKey) + '</span>'
      }));
    });
    wrap.appendChild(tabs);

    const content = el('div', { class: 'col', style: 'gap:18px' });
    if (tab === 'overview') content.appendChild(projOverview(p, pct));
    else if (tab === 'tasks') content.appendChild(projTasks(p));
    else if (tab === 'risks') content.appendChild(projRisks(p));
    else if (tab === 'milestones') content.appendChild(projMilestones(p));
    else if (tab === 'impact') content.appendChild(projImpact(p));
    else if (tab === 'notes') content.appendChild(projNotes(p));
    wrap.appendChild(content);

    return wrap;
  }

  function projOverview(p, pct) {
    const tasks = S().list('tasks', t => t.project_id === p.id);
    const done = tasks.filter(t => t.status === 'done').length;
    const budgetPct = p.budget ? Math.round(((p.budget_used || 0) / p.budget) * 100) : 0;

    return el('div', { class: 'col', style: 'gap:18px' }, [
      el('div', { class: 'grid grid-4' }, [
        statTile(T('progress'), pct + '%', 'primary'),
        statTile(T('task_count'), done + '/' + tasks.length, 'info'),
        statTile(T('budget'), UI.fmtMoney(p.budget || 0), 'success'),
        statTile(T('budget_used'), UI.fmtMoney(p.budget_used || 0), budgetPct > 100 ? 'danger' : 'warn')
      ]),
      el('div', { class: 'grid grid-2' }, [
        el('div', { class: 'card' }, [
          el('div', { class: 'card-head' }, [el('div', { class: 'card-title', text: T('details') })]),
          el('div', { class: 'card-body' }, [
            kvRow(T('owner'), p.owner || '—'),
            kvRow(T('start_date'), UI.fmtDate(p.start_date)),
            kvRow(T('end_date'), UI.fmtDate(p.end_date)),
            kvRow(T('priority'), UI.prioLabel(p.priority || 'medium')),
            kvRow(T('created'), UI.fmtDate(p.created_at))
          ])
        ]),
        el('div', { class: 'card' }, [
          el('div', { class: 'card-head' }, [el('div', { class: 'card-title', text: T('budget') })]),
          el('div', { class: 'card-body' }, [
            el('div', { class: 'row', style: 'justify-content:space-between;margin-bottom:8px' }, [
              el('strong', { text: UI.fmtMoney(p.budget_used || 0) }),
              el('span', { class: 'muted', text: '/ ' + UI.fmtMoney(p.budget || 0) })
            ]),
            el('div', { class: 'progress ' + UI.progressClass(budgetPct) }, [el('i', { style: `width:${Math.min(budgetPct, 100)}%` })])
          ])
        ])
      ])
    ]);
  }

  function projTasks(p) {
    const tasks = S().list('tasks', t => t.project_id === p.id);
    const wrap = el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [
        el('div', { class: 'grow' }, [el('div', { class: 'card-title', text: T('nav_tasks') })]),
        el('button', {
          class: 'btn btn-sm btn-primary', html: svgPlus() + '<span>' + T('add') + '</span>',
          onclick: () => taskForm(null, p.id)
        })
      ])
    ]);
    if (!tasks.length) { wrap.appendChild(empty('no_tasks', 'no_tasks_hint')); return wrap; }
    const list = el('div', { class: 'list' });
    tasks.forEach(t => list.appendChild(taskRow(t, true)));
    wrap.appendChild(list);
    return wrap;
  }

  function projRisks(p) {
    const risks = S().list('risks', r => r.project_id === p.id);
    const wrap = el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [
        el('div', { class: 'grow' }, [el('div', { class: 'card-title', text: T('risks') })]),
        el('button', {
          class: 'btn btn-sm btn-primary', html: svgPlus() + '<span>' + T('add') + '</span>',
          onclick: () => riskForm(null, p.id)
        })
      ])
    ]);
    if (!risks.length) { wrap.appendChild(empty('risks', 'no_data')); return wrap; }
    const list = el('div', { class: 'list' });
    risks.forEach(r => {
      list.appendChild(el('div', { class: 'list-item' }, [
        el('span', { class: 'risk-cell ' + (r.severity || 'med'), text: (r.severity || 'M')[0].toUpperCase() }),
        el('div', { class: 'grow' }, [
          el('div', { class: 'title', text: r.title || '—' }),
          el('div', { class: 'meta', text: r.description || '' })
        ]),
        el('button', { class: 'icon-btn', html: svgTrash(), onclick: () => deleteEntity('risks', r) })
      ]));
    });
    wrap.appendChild(list);
    return wrap;
  }

  function projMilestones(p) {
    const ms = S().list('milestones', m => m.project_id === p.id);
    const wrap = el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [
        el('div', { class: 'grow' }, [el('div', { class: 'card-title', text: T('milestones') })]),
        el('button', {
          class: 'btn btn-sm btn-primary', html: svgPlus() + '<span>' + T('add') + '</span>',
          onclick: () => milestoneForm(null, p.id)
        })
      ])
    ]);
    if (!ms.length) { wrap.appendChild(empty('milestones', 'no_data')); return wrap; }
    const tl = el('div', { class: 'timeline', style: 'padding:18px 26px 0' });
    ms.forEach(m => {
      tl.appendChild(el('div', {
        class: 'timeline-item ' + (m.done ? 'done' : '')
      }, [
        el('div', { class: 'row', style: 'justify-content:space-between' }, [
          el('strong', { text: m.title || '—' }),
          el('span', { class: 'muted text-xs', text: UI.fmtDate(m.date) })
        ]),
        el('div', { class: 'text-sm muted', text: m.description || '' })
      ]));
    });
    wrap.appendChild(tl);
    return wrap;
  }

  function projImpact(p) {
    const sdg = S().list('sdg', x => x.project_id === p.id);
    const esg = S().list('esg', x => x.project_id === p.id);
    return el('div', { class: 'col', style: 'gap:16px' }, [
      el('div', { class: 'card' }, [
        el('div', { class: 'card-head' }, [el('div', { class: 'card-title', text: T('sdg_title') })]),
        el('div', { class: 'card-body' }, [
          sdg.length
            ? el('div', { class: 'row tight' }, sdg.map(s => el('span', { class: 'chip primary', text: 'SDG ' + s.number + ' · ' + I18n.sdgName(s.number) })))
            : el('p', { class: 'muted', text: T('no_data') })
        ])
      ]),
      el('div', { class: 'card' }, [
        el('div', { class: 'card-head' }, [el('div', { class: 'card-title', text: T('esg_title') })]),
        el('div', { class: 'card-body' }, [
          esg.length
            ? el('div', { class: 'col' }, esg.map(e => el('div', { class: 'esg-row' }, [
                el('span', { class: 'text-sm fw-6', text: e.pillar || '—' }),
                el('div', { class: 'progress' }, [el('i', { style: `width:${e.score || 0}%` })]),
                el('span', { class: 'val', text: (e.score || 0) + '%' })
              ])))
            : el('p', { class: 'muted', text: T('no_data') })
        ])
      ])
    ]);
  }

  function projNotes(p) {
    const notes = S().list('notes', n => n.project_id === p.id);
    const body = el('div', { class: 'col', style: 'gap:12px' }, [
      el('textarea', { class: 'textarea', id: 'noteInput', placeholder: T('add_note') + '…' }),
      el('button', {
        class: 'btn btn-primary', html: svgPlus() + '<span>' + T('add_note') + '</span>',
        onclick: () => {
          const ta = document.getElementById('noteInput');
          if (!ta.value.trim()) return;
          S().create('notes', { project_id: p.id, text: ta.value.trim() });
          ta.value = ''; UI.toast(T('msg_saved'), 'success'); render();
        }
      })
    ]);
    const list = el('div', { class: 'col', style: 'gap:10px;margin-top:16px' });
    notes.forEach(n => list.appendChild(el('div', { class: 'note' }, [
      el('div', { class: 'row', style: 'justify-content:space-between' }, [
        el('span', { class: 'text-xs muted', text: UI.relTime(n.created_at) }),
        el('button', { class: 'icon-btn', html: svgTrash(), onclick: () => deleteEntity('notes', n) })
      ]),
      el('div', { text: n.text })
    ])));
    return el('div', {}, [body, notes.length ? list : null]);
  }

  /* ============================================================
     TASKS (GLOBAL)
     ============================================================ */
  function tasks() {
    const all = S().list('tasks');
    const projects = S().list('projects');
    const filterProject = state.taskProjectFilter || 'all';
    const filterStatus = state.taskStatusFilter || 'all';
    let items = all.filter(t => {
      if (filterProject !== 'all' && t.project_id !== filterProject) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      return true;
    });

    const wrap = el('div', { class: 'col', style: 'gap:18px' });
    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('h1', { class: 'page-title', text: T('tasks_title') }),
        el('p', { class: 'page-sub', text: T('tasks_sub') })
      ]),
      el('div', { class: 'page-actions' }, [
        el('button', {
          class: 'btn btn-primary', html: svgPlus() + '<span>' + T('new_task') + '</span>',
          onclick: () => taskForm()
        })
      ])
    ]));

    /* Filters */
    const filters = el('div', { class: 'row tight' }, [
      el('select', {
        class: 'select', style: 'max-width:220px',
        onchange: (e) => { state.taskProjectFilter = e.target.value; render(); }
      }, [
        el('option', { value: 'all', text: T('all_projects'), selected: filterProject === 'all' }),
        ...projects.map(p => el('option', { value: p.id, text: p.name, selected: filterProject === p.id }))
      ]),
      el('select', {
        class: 'select', style: 'max-width:180px',
        onchange: (e) => { state.taskStatusFilter = e.target.value; render(); }
      }, [
        el('option', { value: 'all', text: T('all'), selected: filterStatus === 'all' }),
        ...['todo', 'in_progress', 'done', 'blocked'].map(s => el('option', { value: s, text: T('status_' + s), selected: filterStatus === s }))
      ])
    ]);
    wrap.appendChild(filters);

    if (!items.length) { wrap.appendChild(empty('no_tasks', 'no_data')); return wrap; }

    const card = el('div', { class: 'card' });
    const list = el('div', { class: 'list' });
    items.forEach(t => list.appendChild(taskRow(t)));
    card.appendChild(list);
    wrap.appendChild(card);
    return wrap;
  }

  function taskRow(t, hideProject) {
    const overdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done';
    const project = t.project_id ? S().get('projects', t.project_id) : null;
    return el('div', { class: 'list-item' }, [
      el('input', {
        type: 'checkbox', checked: t.status === 'done',
        style: 'width:18px;height:18px;cursor:pointer',
        onchange: (e) => {
          S().update('tasks', t.id, { status: e.target.checked ? 'done' : 'todo' });
          render();
        }
      }),
      el('div', { class: 'grow', style: 'min-width:0' }, [
        el('div', {
          class: 'title',
          style: t.status === 'done' ? 'text-decoration:line-through;opacity:.6' : '',
          text: t.title || '—'
        }),
        el('div', { class: 'meta' }, [
          !hideProject && project ? el('span', { text: project.name + ' · ' }) : null,
          el('span', { text: t.due_date ? UI.fmtDate(t.due_date) : T('no_data') })
        ].filter(Boolean))
      ]),
      overdue ? el('span', { class: 'badge danger', text: T('overdue') }) : null,
      el('span', {
        class: 'badge ' + UI.statusTone(t.status || 'todo'),
        text: UI.statusLabel(t.status || 'todo')
      }),
      el('button', { class: 'icon-btn', html: svgEdit(), onclick: () => taskForm(t) }),
      el('button', { class: 'icon-btn', html: svgTrash(), onclick: () => deleteEntity('tasks', t) })
    ].filter(Boolean));
  }

  function taskForm(task, presetProjectId) {
    const isEdit = !!task;
    const projects = S().list('projects');
    const d = task || {
      status: 'todo', priority: 'medium',
      project_id: presetProjectId || (projects[0] && projects[0].id) || '',
      due_date: ''
    };
    const body = el('div', { class: 'form-grid' }, [
      field(T('task_title'), input('title', d.title, { required: true }), 'span-2'),
      field(T('task_project'), el('select', { class: 'select', name: 'project_id' },
        projects.map(p => el('option', { value: p.id, text: p.name, selected: d.project_id === p.id }))
      )),
      field(T('assignee'), input('assignee', d.assignee)),
      field(T('status'), select('status', d.status, ['todo', 'in_progress', 'done', 'blocked'])),
      field(T('priority'), select('priority', d.priority, ['low', 'medium', 'high', 'critical'])),
      field(T('due_date'), input('due_date', d.due_date, { type: 'date' }))
    ]);
    const form = el('form', {}, [body]);
    const footer = el('div', { class: 'row', style: 'width:100%' }, [
      el('div', { class: 'spacer' }),
      el('button', { class: 'btn btn-ghost', text: T('cancel'), onclick: UI.closeModal }),
      el('button', {
        class: 'btn btn-primary', text: T('save'),
        onclick: () => {
          const data = collect(form);
          if (!data.title) { UI.toast(T('required'), 'warn'); return; }
          if (isEdit) { S().update('tasks', task.id, data); UI.toast(T('msg_updated'), 'success'); }
          else { S().create('tasks', data); UI.toast(T('msg_created'), 'success'); }
          UI.closeModal(); render();
        }
      })
    ]);
    UI.openModal({ title: isEdit ? T('edit_task') : T('new_task'), body: form, footer });
  }

  /* ============================================================
     STRATEGY (SWOT + PESTEL + OKRs)
     ============================================================ */
  function strategy() {
    const wrap = el('div', { class: 'col', style: 'gap:22px' });
    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('h1', { class: 'page-title', text: T('strategy_title') }),
        el('p', { class: 'page-sub', text: T('strategy_sub') })
      ])
    ]));

    wrap.appendChild(el('h2', { class: 'section-title', text: T('swot') }));
    wrap.appendChild(swotBlock());

    wrap.appendChild(el('h2', { class: 'section-title', text: T('pestel') }));
    wrap.appendChild(pestelBlock());

    wrap.appendChild(el('h2', { class: 'section-title', text: T('okrs') }));
    wrap.appendChild(okrBlock());

    return wrap;
  }

  function swotBlock() {
    const grid = el('div', { class: 'swot-grid' });
    const quadrants = [
      ['s', 'swot_strengths', 'Strengths'],
      ['w', 'swot_weaknesses', 'Weaknesses'],
      ['o', 'swot_opportunities', 'Opportunities'],
      ['t', 'swot_threats', 'Threats']
    ];
    quadrants.forEach(([key, labelKey, defaultText]) => {
      const items = S().list('swot', x => x.quadrant === key);
      const cell = el('div', { class: 'swot-cell ' + key }, [
        el('header', {}, [
          el('span', { class: 'grow', text: T(labelKey) }),
          el('button', {
            class: 'icon-btn', style: 'width:28px;height:28px',
            html: svgPlus(),
            onclick: () => {
              const v = prompt(T('add_item'));
              if (v && v.trim()) { S().create('swot', { quadrant: key, text: v.trim() }); render(); }
            }
          })
        ])
      ]);
      const ul = el('ul', { class: 'items' });
      if (!items.length) ul.appendChild(el('li', { class: 'muted', text: T('no_data') }));
      items.forEach(it => ul.appendChild(el('li', {}, [
        el('span', { class: 'grow', text: it.text }),
        el('button', {
          class: 'x icon-btn', style: 'width:22px;height:22px',
          html: svgX(),
          onclick: () => { S().remove('swot', it.id); render(); }
        })
      ])));
      cell.appendChild(ul);
      grid.appendChild(cell);
    });
    return grid;
  }

  function pestelBlock() {
    const grid = el('div', { class: 'pestel-grid' });
    const keys = [
      ['p', 'pestel_political'], ['e', 'pestel_economic'], ['s', 'pestel_social'],
      ['t', 'pestel_technological'], ['en', 'pestel_environmental'], ['l', 'pestel_legal']
    ];
    keys.forEach(([key, labelKey]) => {
      const items = S().list('pestel', x => x.category === key);
      const card = el('div', { class: 'pestel-card ' + key }, [
        el('h4', {}, [
          el('span', { class: 'grow', text: T(labelKey) }),
          el('button', {
            class: 'icon-btn', style: 'width:26px;height:26px', html: svgPlus(),
            onclick: () => {
              const v = prompt(T('add_item'));
              if (v && v.trim()) { S().create('pestel', { category: key, text: v.trim() }); render(); }
            }
          })
        ])
      ]);
      if (!items.length) card.appendChild(el('p', { class: 'muted text-sm', text: T('no_data') }));
      items.forEach(it => card.appendChild(el('div', { class: 'row tight', style: 'margin-top:6px' }, [
        el('span', { class: 'text-sm grow', text: it.text }),
        el('button', {
          class: 'icon-btn', style: 'width:22px;height:22px', html: svgX(),
          onclick: () => { S().remove('pestel', it.id); render(); }
        })
      ])));
      grid.appendChild(card);
    });
    return grid;
  }

  function okrBlock() {
    const objectives = S().list('okrs', o => !o.parent_id);
    const wrap = el('div', { class: 'col', style: 'gap:14px' }, [
      el('div', {}, [
        el('button', {
          class: 'btn btn-primary btn-sm',
          html: svgPlus() + '<span>' + T('new_objective') + '</span>',
          onclick: () => {
            const t = prompt(T('objective'));
            if (t && t.trim()) { S().create('okrs', { title: t.trim(), type: 'objective' }); render(); }
          }
        })
      ])
    ]);
    if (!objectives.length) { wrap.appendChild(empty('no_okrs', 'no_data')); return wrap; }
    const list = el('div', { class: 'okr' });
    objectives.forEach(o => {
      const krs = S().list('okrs', k => k.parent_id === o.id);
      const avg = krs.length
        ? Math.round(krs.reduce((s, k) => s + progressKR(k), 0) / krs.length)
        : 0;
      const card = el('div', { class: 'okr-objective' }, [
        el('header', {}, [
          el('div', { class: 'grow' }, [
            el('div', { class: 'o-title', text: o.title }),
            el('div', { class: 'text-xs muted', text: krs.length + ' ' + T('key_result') })
          ]),
          el('div', { class: 'ring', style: `--p:${avg}` }, [el('span', { text: avg + '%' })]),
          el('button', {
            class: 'icon-btn', html: svgTrash(),
            onclick: () => {
              krs.forEach(k => S().remove('okrs', k.id));
              S().remove('okrs', o.id); render();
            }
          })
        ]),
        el('div', { class: 'kr-list' }, krs.map(k => krRow(k))),
        el('div', { style: 'margin-top:10px' }, [
          el('button', {
            class: 'btn btn-sm btn-soft',
            html: svgPlus() + '<span>' + T('add_kr') + '</span>',
            onclick: () => {
              const t = prompt(T('key_result'));
              if (t && t.trim()) { S().create('okrs', { parent_id: o.id, title: t.trim(), target: 100, current: 0, type: 'kr' }); render(); }
            }
          })
        ])
      ]);
      list.appendChild(card);
    });
    wrap.appendChild(list);
    return wrap;
  }

  function krRow(k) {
    const pct = progressKR(k);
    return el('div', { class: 'kr' }, [
      el('div', { class: 'kr-top' }, [
        el('span', { class: 'kr-title', text: k.title }),
        el('span', { class: 'kr-val', text: (k.current || 0) + ' / ' + (k.target || 100) })
      ]),
      el('div', { class: 'progress ' + UI.progressClass(pct) }, [el('i', { style: `width:${pct}%` })]),
      el('div', { class: 'row tight mt-2' }, [
        el('button', {
          class: 'btn btn-sm btn-ghost',
          text: '+10%',
          onclick: () => {
            const t = Number(k.target) || 100;
            const c = Math.min(t, (Number(k.current) || 0) + Math.round(t * 0.1));
            S().update('okrs', k.id, { current: c }); render();
          }
        }),
        el('button', {
          class: 'btn btn-sm btn-ghost',
          text: '+25%',
          onclick: () => {
            const t = Number(k.target) || 100;
            const c = Math.min(t, (Number(k.current) || 0) + Math.round(t * 0.25));
            S().update('okrs', k.id, { current: c }); render();
          }
        }),
        el('div', { class: 'spacer' }),
        el('button', { class: 'icon-btn', html: svgTrash(), onclick: () => { S().remove('okrs', k.id); render(); } })
      ])
    ]);
  }

  function progressKR(k) {
    const t = Number(k.target) || 100;
    const c = Number(k.current) || 0;
    return Math.max(0, Math.min(100, Math.round((c / t) * 100)));
  }

  /* ============================================================
     IMPACT (SDG + ESG + P5)
     ============================================================ */
  function impact() {
    const wrap = el('div', { class: 'col', style: 'gap:22px' });
    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('h1', { class: 'page-title', text: T('impact_title') }),
        el('p', { class: 'page-sub', text: T('impact_sub') })
      ])
    ]));

    /* SDG */
    wrap.appendChild(el('h2', { class: 'section-title', text: T('sdg_title') }));
    const selected = new Set(S().list('sdg').map(s => s.number));
    const sdgGrid = el('div', { class: 'sdg-grid' });
    for (let n = 1; n <= 17; n++) {
      const isSel = selected.has(n);
      const colors = ['#e5243b','#dda63a','#4c9f38','#c5192d','#ff3a21','#26bde2','#fcc30b','#a21942',
        '#fd6925','#dd1367','#fd9d24','#bf8b2e','#3f7e44','#0a97d9','#56c02b','#00689d','#19486a'];
      sdgGrid.appendChild(el('button', {
        class: 'sdg-item' + (isSel ? ' selected' : ''),
        style: `--sdg:${colors[n - 1]}`,
        onclick: () => {
          if (isSel) {
            const rec = S().list('sdg', s => s.number === n)[0];
            if (rec) S().remove('sdg', rec.id);
          } else {
            S().create('sdg', { number: n, score: 0 });
          }
          render();
        }
      }, [
        el('span', { class: 'no', text: n }),
        el('span', { class: 'name', text: I18n.sdgName(n) })
      ]));
    }
    wrap.appendChild(sdgGrid);

    /* ESG */
    wrap.appendChild(el('h2', { class: 'section-title', text: T('esg_title') }));
    const esgCard = el('div', { class: 'card' }, [
      el('div', { class: 'card-body' }, [
        ['environmental', 'esg_environmental', 'success'],
        ['social', 'esg_social', 'info'],
        ['governance', 'esg_governance', 'purple']
      ].map(([key, labelKey, tone]) => {
        const rec = S().list('esg', e => e.pillar === key)[0];
        const val = rec ? (rec.score || 0) : 0;
        return el('div', { class: 'esg-row' }, [
          el('span', { class: 'text-sm fw-7', text: T(labelKey) }),
          el('div', { class: 'progress ' + tone }, [el('i', { style: `width:${val}%` })]),
          el('input', {
            type: 'number', class: 'input', style: 'width:72px;min-height:32px;padding:4px 8px',
            value: val, min: 0, max: 100,
            onchange: (e) => {
              const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
              if (rec) S().update('esg', rec.id, { score: v });
              else S().create('esg', { pillar: key, score: v });
              render();
            }
          })
        ]);
      })
    )]);
    wrap.appendChild(esgCard);

    /* P5 */
    wrap.appendChild(el('h2', { class: 'section-title', text: T('p5_title') }));
    const p5Grid = el('div', { class: 'p5-grid' });
    [
      ['people', 'p5_people', '#e5243b'],
      ['planet', 'p5_planet', '#4c9f38'],
      ['prosperity', 'p5_prosperity', '#fcc30b'],
      ['peace', 'p5_peace', '#3f7e44'],
      ['partnership', 'p5_partnership', '#0a97d9']
    ].forEach(([key, labelKey, color]) => {
      const rec = S().list('p5', x => x.pillar === key)[0];
      const val = rec ? (rec.score || 0) : 0;
      p5Grid.appendChild(el('div', { class: 'p5-item', style: `--p5:${color};--p5c:${color}22` }, [
        el('div', { class: 'ico' }, [el('span', { text: '◆' })]),
        el('h4', { text: T(labelKey) }),
        el('div', { class: 'score', text: val + '%' }),
        el('input', {
          type: 'range', class: 'range', value: val, min: 0, max: 100,
          style: 'margin-top:10px',
          oninput: (e) => {
            const v = Number(e.target.value);
            if (rec) S().update('p5', rec.id, { score: v });
            else S().create('p5', { pillar: key, score: v });
            render();
          }
        })
      ]));
    });
    wrap.appendChild(p5Grid);

    return wrap;
  }

  /* ============================================================
     SALES PIPELINE (Kanban)
     ============================================================ */
  const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

  function sales() {
    const deals = S().list('deals');
    const wrap = el('div', { class: 'col', style: 'gap:18px' });

    const totalValue = deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + (Number(d.value) || 0), 0);
    const weightedValue = deals.filter(d => d.stage !== 'lost')
      .reduce((s, d) => s + (Number(d.value) || 0) * ((Number(d.probability) || 0) / 100), 0);
    const wonValue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + (Number(d.value) || 0), 0);

    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('h1', { class: 'page-title', text: T('sales_title') }),
        el('p', { class: 'page-sub', text: T('sales_sub') })
      ]),
      el('div', { class: 'page-actions' }, [
        el('button', {
          class: 'btn btn-primary', html: svgPlus() + '<span>' + T('new_deal') + '</span>',
          onclick: () => dealForm()
        })
      ])
    ]));

    wrap.appendChild(el('div', { class: 'grid grid-4' }, [
      stat(T('pipeline_value'), UI.fmtMoney(totalValue), '', 'primary', svgChart()),
      stat(T('weighted'), UI.fmtMoney(weightedValue), '', 'info', svgChart()),
      stat(T('stage_won'), UI.fmtMoney(wonValue), '', 'success', svgCheck()),
      stat(T('total'), deals.length, '', 'purple', svgFolder())
    ]));

    /* Kanban */
    const kanban = el('div', { class: 'kanban' });
    STAGES.forEach(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      const sum = stageDeals.reduce((s, d) => s + (Number(d.value) || 0), 0);
      const col = el('div', { class: 'kanban-col stage-' + stage }, [
        el('div', { class: 'kanban-head' }, [
          el('span', { class: 'name', text: T('stage_' + stage) }),
          el('span', { class: 'count', text: stageDeals.length })
        ]),
        el('div', { class: 'bar' }),
        el('span', { class: 'sum', text: UI.fmtMoney(sum) })
      ]);
      const cards = el('div', {
        class: 'kanban-cards',
        'data-stage': stage,
        ondragover: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('drag-over'); },
        ondragleave: (e) => e.currentTarget.classList.remove('drag-over'),
        ondrop: (e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('drag-over');
          const id = e.dataTransfer.getData('text/plain');
          if (id) { S().update('deals', id, { stage }); render(); }
        }
      });
      stageDeals.forEach(d => cards.appendChild(dealCard(d)));
      col.appendChild(cards);
      kanban.appendChild(col);
    });
    wrap.appendChild(kanban);

    return wrap;
  }

  function dealCard(d) {
    const pct = Number(d.probability) || 0;
    return el('div', {
      class: 'deal-card',
      draggable: true,
      ondragstart: (e) => {
        e.dataTransfer.setData('text/plain', d.id);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
      },
      ondragend: (e) => e.currentTarget.classList.remove('dragging'),
      onclick: (e) => { if (!e.target.closest('button')) dealForm(d); }
    }, [
      el('div', { class: 'client', text: d.client || '—' }),
      el('div', { class: 'value', text: UI.fmtMoney(d.value || 0) }),
      el('div', { class: 'meta' }, [
        el('span', { class: 'prob', text: pct + '%' }),
        el('span', { text: d.expected_close ? UI.fmtDate(d.expected_close) : '—' })
      ])
    ]);
  }

  function dealForm(deal) {
    const isEdit = !!deal;
    const d = deal || { stage: 'lead', probability: 10, value: 0 };
    const body = el('div', { class: 'form-grid' }, [
      field(T('client'), input('client', d.client, { required: true }), 'span-2'),
      field(T('deal_value'), input('value', d.value, { type: 'number', min: 0 })),
      field(T('stage'), select('stage', d.stage, STAGES)),
      field(T('probability'), input('probability', d.probability, { type: 'number', min: 0, max: 100 })),
      field(T('expected_close'), input('expected_close', d.expected_close, { type: 'date' })),
      field(T('owner'), input('owner', d.owner)),
      field(T('notes'), textarea('notes', d.notes), 'span-full')
    ]);
    const form = el('form', {}, [body]);
    const footer = el('div', { class: 'row', style: 'width:100%' }, [
      isEdit ? el('button', {
        class: 'btn btn-danger btn-sm', html: svgTrash() + '<span>' + T('delete') + '</span>',
        onclick: () => { S().remove('deals', deal.id); UI.closeModal(); UI.toast(T('msg_deleted'), 'success'); render(); }
      }) : null,
      el('div', { class: 'spacer' }),
      el('button', { class: 'btn btn-ghost', text: T('cancel'), onclick: UI.closeModal }),
      el('button', {
        class: 'btn btn-primary', text: T('save'),
        onclick: () => {
          const data = collect(form);
          if (!data.client) { UI.toast(T('required'), 'warn'); return; }
          data.value = Number(data.value) || 0;
          data.probability = Number(data.probability) || 0;
          if (isEdit) { S().update('deals', deal.id, data); UI.toast(T('msg_updated'), 'success'); }
          else { S().create('deals', data); UI.toast(T('msg_created'), 'success'); }
          UI.closeModal(); render();
        }
      })
    ].filter(Boolean));
    UI.openModal({ title: isEdit ? T('edit_deal') : T('new_deal'), body: form, footer });
  }

  /* ============================================================
     MEDDIC
     ============================================================ */
  function meddic() {
    const items = S().list('meddic');
    const wrap = el('div', { class: 'col', style: 'gap:18px' });
    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('h1', { class: 'page-title', text: T('meddic') }),
        el('p', { class: 'page-sub', text: T('sales_sub') })
      ])
    ]));
    const grid = el('div', { class: 'meddic-grid' });
    [
      ['metrics', 'meddic_metrics', 'M'],
      ['buyer', 'meddic_metrics_d', 'E'],
      ['criteria', 'meddic_decision', 'D'],
      ['process', 'meddic_process', 'D'],
      ['pain', 'meddic_identify', 'I'],
      ['champion', 'meddic_champion', 'C']
    ].forEach(([key, labelKey, letter]) => {
      const rec = items.find(i => i.key === key);
      const score = rec ? (rec.score || 0) : 0;
      grid.appendChild(el('div', { class: 'meddic-item' }, [
        el('div', { class: 'letter', text: letter }),
        el('h4', { text: T(labelKey) }),
        el('p', { text: T('indicators') + ': ' + score + '%' }),
        el('div', { class: 'meddic-score' }, [
          el('div', { class: 'progress thin', style: 'flex:1' }, [el('i', { style: `width:${score}%` })]),
          el('input', {
            type: 'number', class: 'input', style: 'width:64px;min-height:28px;padding:2px 6px',
            value: score, min: 0, max: 100,
            onchange: (e) => {
              const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
              if (rec) S().update('meddic', rec.id, { score: v });
              else S().create('meddic', { key, score: v });
              render();
            }
          })
        ])
      ]));
    });
    wrap.appendChild(grid);
    return wrap;
  }

  /* ============================================================
     REPORTS
     ============================================================ */
  function reports() {
    const wrap = el('div', { class: 'col', style: 'gap:22px' });
    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('h1', { class: 'page-title', text: T('reports_title') }),
        el('p', { class: 'page-sub', text: T('reports_sub') })
      ])
    ]));

    const projects = S().list('projects');
    const tasks = S().list('tasks');
    const deals = S().list('deals');

    const byStatus = (arr, field) => arr.reduce((m, x) => {
      const k = x[field] || 'unknown';
      m[k] = (m[k] || 0) + 1; return m;
    }, {});

    wrap.appendChild(el('div', { class: 'grid grid-3' }, [
      reportCard(T('report_projects'), byStatus(projects, 'status'), projects.length),
      reportCard(T('report_tasks'), byStatus(tasks, 'status'), tasks.length),
      reportCard(T('report_sales'), byStatus(deals, 'stage'), deals.length)
    ]));

    return wrap;
  }

  function reportCard(title, counts, total) {
    const entries = Object.entries(counts);
    return el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [
        el('div', { class: 'grow' }, [
          el('div', { class: 'card-title', text: title }),
          el('div', { class: 'card-sub', text: total + ' ' + T('total') })
        ])
      ]),
      el('div', { class: 'card-body' }, entries.length ? entries.map(([k, v]) => {
        const pct = total ? Math.round((v / total) * 100) : 0;
        const isStatus = ['idea','active','planning','on_hold','completed','cancelled','todo','in_progress','done','blocked','archived'].includes(k);
        const label = isStatus ? UI.statusLabel(k) : (STAGES.includes(k) ? T('stage_' + k) : k);
        return el('div', { class: 'esg-row' }, [
          el('span', { class: 'text-sm fw-6', text: label }),
          el('div', { class: 'progress thin' }, [el('i', { style: `width:${pct}%` })]),
          el('span', { class: 'val', text: v })
        ]);
      }) : el('p', { class: 'muted', text: T('no_data') }))
    ]);
  }

  /* ============================================================
     SETTINGS
     ============================================================ */
  function settings() {
    const s = S().getSettings();
    const wrap = el('div', { class: 'col', style: 'gap:22px' });
    wrap.appendChild(el('div', { class: 'page-head' }, [
      el('div', { class: 'grow' }, [
        el('h1', { class: 'page-title', text: T('settings_title') }),
        el('p', { class: 'page-sub', text: T('settings_sub') })
      ])
    ]));

    /* Language & Theme */
    wrap.appendChild(el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [el('div', { class: 'card-title', text: T('language') + ' / ' + T('theme') })]),
      el('div', { class: 'card-body' }, [
        el('div', { class: 'row', style: 'gap:16px;flex-wrap:wrap' }, [
          el('div', { class: 'field', style: 'flex:1;min-width:200px' }, [
            el('label', { class: 'label', text: T('language') }),
            el('select', {
              class: 'select', onchange: (e) => global.App.setLang(e.target.value)
            }, [
              el('option', { value: 'ar', text: 'العربية', selected: s.lang === 'ar' }),
              el('option', { value: 'en', text: 'English', selected: s.lang === 'en' })
            ])
          ]),
          el('div', { class: 'field', style: 'flex:1;min-width:200px' }, [
            el('label', { class: 'label', text: T('theme') }),
            el('select', {
              class: 'select', onchange: (e) => global.App.setTheme(e.target.value)
            }, [
              el('option', { value: 'light', text: T('theme_light'), selected: s.theme === 'light' }),
              el('option', { value: 'dark', text: T('theme_dark'), selected: s.theme === 'dark' })
            ])
          ])
        ])
      ])
    ]));

    /* Supabase */
    const user = s.user;
    wrap.appendChild(el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [
        el('div', { class: 'grow' }, [
          el('div', { class: 'card-title', text: T('supabase_config') }),
          el('div', { class: 'card-sub', text: user ? (T('connected') + ' · ' + user.email) : T('not_connected') })
        ]),
        el('span', { class: 'badge ' + (user ? 'success' : 'muted'), text: user ? T('connected') : T('not_connected') })
      ]),
      el('div', { class: 'card-body' }, user ? [
        el('div', { class: 'row' }, [
          el('button', {
            class: 'btn btn-soft', html: svgRefresh() + '<span>' + T('sync_now') + '</span>',
            onclick: async () => {
              try { await S().syncNow(); UI.toast(T('msg_synced'), 'success'); render(); }
              catch (e) { UI.toast(T('msg_sync_error'), 'error'); }
            }
          }),
          el('button', {
            class: 'btn btn-ghost', text: T('sign_out'),
            onclick: async () => { await S().signOut(); UI.toast(T('msg_logout'), 'info'); render(); }
          })
        ])
      ] : [
        el('div', { class: 'form-grid' }, [
          field(T('supabase_url'), el('input', {
            class: 'input', id: 'sbUrl', placeholder: 'https://xxx.supabase.co', value: s.supabaseUrl || ''
          }), 'span-2'),
          field(T('supabase_key'), el('input', {
            class: 'input', id: 'sbKey', placeholder: 'eyJ...', value: s.supabaseKey || ''
          }), 'span-2'),
          field(T('email'), el('input', { class: 'input', id: 'sbEmail', type: 'email' })),
          field(T('password'), el('input', { class: 'input', id: 'sbPass', type: 'password' }))
        ]),
        el('div', { class: 'row mt-4' }, [
          el('button', {
            class: 'btn btn-ghost', text: T('connect'),
            onclick: () => {
              const url = document.getElementById('sbUrl').value.trim();
              const key = document.getElementById('sbKey').value.trim();
              if (!url || !key) { UI.toast(T('msg_no_supabase'), 'warn'); return; }
              S().setSettings({ supabaseUrl: url, supabaseKey: key });
              UI.toast(T('msg_saved'), 'success'); render();
            }
          }),
          el('button', {
            class: 'btn btn-primary', text: T('sign_in'),
            onclick: async () => {
              const email = document.getElementById('sbEmail').value.trim();
              const pass = document.getElementById('sbPass').value;
              if (!email) { UI.toast(T('msg_invalid_email'), 'warn'); return; }
              try { await S().signIn(email, pass); UI.toast(T('msg_login_success'), 'success'); render(); }
              catch (e) { UI.toast(e.message || T('msg_error'), 'error'); }
            }
          }),
          el('button', {
            class: 'btn btn-soft', text: T('sign_up'),
            onclick: async () => {
              const email = document.getElementById('sbEmail').value.trim();
              const pass = document.getElementById('sbPass').value;
              if (!email) { UI.toast(T('msg_invalid_email'), 'warn'); return; }
              try { await S().signUp(email, pass); UI.toast(T('msg_login_success'), 'success'); render(); }
              catch (e) { UI.toast(e.message || T('msg_error'), 'error'); }
            }
          })
        ])
      ])
    ]));

    /* Data */
    wrap.appendChild(el('div', { class: 'card' }, [
      el('div', { class: 'card-head' }, [el('div', { class: 'card-title', text: T('data_management') })]),
      el('div', { class: 'card-body' }, [
        el('div', { class: 'row' }, [
          el('button', {
            class: 'btn btn-ghost', html: svgDownload() + '<span>' + T('export_data') + '</span>',
            onclick: () => {
              const blob = new Blob([S().exportData()], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'biz-dev-' + new Date().toISOString().slice(0, 10) + '.json';
              a.click();
              URL.revokeObjectURL(url);
              UI.toast(T('msg_exported'), 'success');
            }
          }),
          el('label', { class: 'btn btn-ghost', style: 'cursor:pointer' }, [
            el('span', { html: svgUpload() + '<span style="margin-inline-start:6px">' + T('import_data') + '</span>' }),
            el('input', {
              type: 'file', accept: 'application/json', style: 'display:none',
              onchange: async (e) => {
                const f = e.target.files[0]; if (!f) return;
                try {
                  const text = await f.text();
                  S().importData(text);
                  UI.toast(T('msg_imported'), 'success'); render();
                } catch (err) { UI.toast(T('msg_error'), 'error'); }
              }
            })
          ]),
          el('div', { class: 'spacer' }),
          el('button', {
            class: 'btn btn-danger', text: T('reset_data'),
            onclick: async () => {
              const ok = await UI.confirmDialog({ message: T('reset_confirm'), danger: true });
              if (ok) { S().resetData(); UI.toast(T('msg_reset'), 'success'); render(); }
            }
          })
        ])
      ])
    ]));

    return wrap;
  }

  /* ============================================================
     HELPERS
     ============================================================ */
  function field(label, control, cls) {
    return el('div', { class: 'field ' + (cls || '') }, [
      el('label', { class: 'label', text: label }),
      control
    ]);
  }

  function input(name, value, opts) {
    return el('input', Object.assign({
      class: 'input', name, value: value != null ? value : ''
    }, opts || {}));
  }

  function textarea(name, value) {
    return el('textarea', { class: 'textarea', name, value: value || '' });
  }

  function select(name, value, options) {
    return el('select', { class: 'select', name },
      options.map(o => el('option', {
        value: o,
        text: T('status_' + o) !== 'status_' + o ? T('status_' + o) : (T(o) || o),
        selected: value === o
      }))
    );
  }

  function rangeInput(name, value, min, max) {
    return el('input', { type: 'range', class: 'range', name, value: value || min, min, max });
  }

  function collect(form) {
    const data = {};
    form.querySelectorAll('input, select, textarea').forEach(el => {
      const n = el.name; if (!n) return;
      if (el.type === 'checkbox') data[n] = el.checked;
      else if (el.type === 'number' || el.type === 'range') data[n] = Number(el.value) || 0;
      else data[n] = el.value;
    });
    return data;
  }

  function empty(titleKey, hintKey) {
    return el('div', { class: 'empty' }, [
      el('div', { class: 'ico', html: svgEmpty() }),
      el('h3', { text: T(titleKey) }),
      el('p', { text: T(hintKey || 'no_data') })
    ]);
  }

  function kvRow(k, v) {
    return el('div', { class: 'row', style: 'justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)' }, [
      el('span', { class: 'muted text-sm', text: k }),
      el('span', { class: 'fw-6 text-sm', text: v })
    ]);
  }

  function statTile(label, value, tone) {
    return el('div', { class: 'stat is-' + tone }, [
      el('div', { class: 'stat-label', text: label }),
      el('div', { class: 'stat-value', text: value })
    ]);
  }

  function notFound() {
    return el('div', { class: 'empty' }, [
      el('div', { class: 'ico', html: svgEmpty() }),
      el('h3', { text: T('no_data') }),
      el('button', { class: 'btn btn-primary', text: T('back'), onclick: () => location.hash = '#/dashboard' })
    ]);
  }

  function toggleArchive(col, item) {
    S().archive(col, item.id, !item.archived);
    UI.toast(item.archived ? T('msg_restored') : T('msg_archived'), 'success');
    render();
  }

  async function deleteEntity(col, item) {
    const ok = await UI.confirmDialog();
    if (!ok) return;
    S().remove(col, item.id);
    UI.toast(T('msg_deleted'), 'success');
    render();
  }

  /* ---------- Risk / Milestone forms ---------- */
  function riskForm(risk, projectId) {
    const isEdit = !!risk;
    const d = risk || { severity: 'med', project_id: projectId };
    const form = el('form', { class: 'form-grid' }, [
      field(T('title'), input('title', d.title, { required: true }), 'span-2'),
      field(T('description'), textarea('description', d.description), 'span-full'),
      field(T('priority'), el('select', { class: 'select', name: 'severity' }, [
        el('option', { value: 'low', text: T('low'), selected: d.severity === 'low' }),
        el('option', { value: 'med', text: T('medium'), selected: d.severity === 'med' }),
        el('option', { value: 'high', text: T('high'), selected: d.severity === 'high' })
      ]))
    ]);
    const footer = el('div', { class: 'row', style: 'width:100%' }, [
      el('div', { class: 'spacer' }),
      el('button', { class: 'btn btn-ghost', text: T('cancel'), onclick: UI.closeModal }),
      el('button', {
        class: 'btn btn-primary', text: T('save'),
        onclick: () => {
          const data = collect(form);
          data.project_id = projectId;
          if (!data.title) return;
          if (isEdit) S().update('risks', risk.id, data);
          else S().create('risks', data);
          UI.closeModal(); UI.toast(T('msg_saved'), 'success'); render();
        }
      })
    ]);
    UI.openModal({ title: T('risks'), body: form, footer });
  }

  function milestoneForm(ms, projectId) {
    const isEdit = !!ms;
    const d = ms || { project_id: projectId, date: UI.todayISO() };
    const form = el('form', { class: 'form-grid' }, [
      field(T('title'), input('title', d.title, { required: true }), 'span-2'),
      field(T('description'), textarea('description', d.description), 'span-full'),
      field(T('date'), input('date', d.date, { type: 'date' })),
      el('label', { class: 'check' }, [
        el('input', { type: 'checkbox', name: 'done', checked: !!d.done }),
        el('span', { text: T('done') })
      ])
    ]);
    const footer = el('div', { class: 'row', style: 'width:100%' }, [
      el('div', { class: 'spacer' }),
      el('button', { class: 'btn btn-ghost', text: T('cancel'), onclick: UI.closeModal }),
      el('button', {
        class: 'btn btn-primary', text: T('save'),
        onclick: () => {
          const data = collect(form);
          data.project_id = projectId;
          if (!data.title) return;
          if (isEdit) S().update('milestones', ms.id, data);
          else S().create('milestones', data);
          UI.closeModal(); UI.toast(T('msg_saved'), 'success'); render();
        }
      })
    ]);
    UI.openModal({ title: T('milestones'), body: form, footer });
  }

  /* ---------- SVG Icons ---------- */
  function svgPlus()   { return '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>'; }
  function svgEdit()   { return '<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'; }
  function svgTrash()  { return '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>'; }
  function svgArchive(){ return '<svg viewBox="0 0 24 24"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg>'; }
  function svgRestore(){ return '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>'; }
  function svgX()      { return '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'; }
  function svgFolder() { return '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>'; }
  function svgCheck()  { return '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'; }
  function svgBulb()   { return '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>'; }
  function svgChart()  { return '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>'; }
  function svgBack()   { return '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>'; }
  function svgInfo()   { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'; }
  function svgWarn()   { return '<svg viewBox="0 0 24 24"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>'; }
  function svgFlag()   { return '<svg viewBox="0 0 24 24"><path d="M4 22V4M4 4h12l-2 4 2 4H4"/></svg>'; }
  function svgLeaf()   { return '<svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 4 13c0-5 3-9 8-10 3 5 5 8 5 12a5 5 0 0 1-6 5z"/></svg>'; }
  function svgNote()   { return '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>'; }
  function svgRefresh(){ return '<svg viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 15-3.4L23 10M1 14l4.5 4.4A9 9 0 0 0 20.5 15"/></svg>'; }
  function svgDownload(){ return '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>'; }
  function svgUpload() { return '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>'; }
  function svgEmpty()  { return '<svg viewBox="0 0 24 24"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg>'; }

  /* ---------- Shared state ---------- */
  const state = {
    ideasArchived: false,
    projectTab: 'overview',
    taskProjectFilter: 'all',
    taskStatusFilter: 'all'
  };

  /* ---------- Router hook ---------- */
  let currentRender = null;
  function setRender(fn) { currentRender = fn; }
  function render() { if (currentRender) currentRender(); }

  /* ---------- EXPORT (this is the key line) ---------- */
  global.Views = {
    dashboard, ideas, projects, projectDetail, tasks,
    strategy, impact, sales, meddic, reports, settings,
    setRender
  };
})(window);