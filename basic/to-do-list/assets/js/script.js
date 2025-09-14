/**
 * To-Do List Application
 * @author Eduardo Costa Nkuansambu
 * @version 1.0.0
 */

class TodoApp {
    /**
     * Construtor da aplicação
     */
    constructor() {
        // Array para armazenar todas as tarefas
        this.tasks = [];
        // Filtro atual (all, pending, completed)
        this.currentFilter = 'all';
        // Contador para IDs únicos das tarefas
        this.taskIdCounter = 1;
        
        // Inicializa a aplicação
        this.init();
    }

    /**
     * Método de inicialização da aplicação
     */
    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.renderTasks();
        this.updateCounters();
        this.setCurrentDate();
    }

    /**
     * Configura todos os eventos da aplicação
     */
    setupEventListeners() {
        // Evento para adicionar nova tarefa
        document.getElementById('addTaskBtn')?.addEventListener('click', () => {
            this.addTask();
        });

        // Evento para adicionar tarefa ao pressionar Enter
        document.getElementById('taskInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Eventos para os filtros
        document.getElementById('filterAll')?.addEventListener('click', () => {
            this.setFilter('all');
        });
        
        document.getElementById('filterPending')?.addEventListener('click', () => {
            this.setFilter('pending');
        });
        
        document.getElementById('filterCompleted')?.addEventListener('click', () => {
            this.setFilter('completed');
        });

        // Evento para limpar todas as tarefas
        document.getElementById('clearAllBtn')?.addEventListener('click', () => {
            this.clearAllTasks();
        });
    }

    /**
     * Carrega as tarefas do localStorage
     */
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('todoTasks');
            const savedCounter = localStorage.getItem('taskIdCounter');
            
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
            
            if (savedCounter) {
                this.taskIdCounter = parseInt(savedCounter);
            }
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            this.tasks = [];
        }
    }

    /**
     * Salva as tarefas no localStorage
     */
    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
        } catch (error) {
            console.error('Erro ao salvar tarefas:', error);
        }
    }

    /**
     * Adiciona uma nova tarefa
     */
    addTask() {
        const taskInput = document.getElementById('taskInput');
        
        if (!taskInput) {
            console.error('Campo de input não encontrado');
            return;
        }

        const taskText = taskInput.value.trim();

        if (taskText === '') {
            this.showAlert('Por favor, digite uma tarefa!', 'warning');
            return;
        }

        // Cria um novo objeto de tarefa
        const newTask = {
            id: this.taskIdCounter++,
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Adiciona a tarefa ao início do array
        this.tasks.unshift(newTask);
        
        // Limpa o campo de input
        taskInput.value = '';
        
        // Salva no localStorage
        this.saveTasks();
        
        // Re-renderiza a lista
        this.renderTasks();
        
        // Atualiza os contadores
        this.updateCounters();

        // Foca novamente no input para facilitar a adição de mais tarefas
        taskInput.focus();
        
        this.showAlert('Tarefa adicionada com sucesso!', 'success');
    }

    /**
     * Remove uma tarefa específica
     * @param {number} taskId - ID da tarefa a ser removida
     */
    removeTask(taskId) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateCounters();
            this.showAlert('Tarefa removida com sucesso!', 'success');
        }
    }

    /**
     * Alterna o status de conclusão de uma tarefa
     * @param {number} taskId - ID da tarefa
     */
    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateCounters();
            
            const status = task.completed ? 'concluída' : 'reaberta';
            this.showAlert(`Tarefa ${status}!`, 'info');
        }
    }

    /**
     * Edita uma tarefa existente
     * @param {number} taskId - ID da tarefa a ser editada
     */
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        
        if (task) {
            const newText = prompt('Editar tarefa:', task.text);
            
            if (newText !== null && newText.trim() !== '') {
                task.text = newText.trim();
                this.saveTasks();
                this.renderTasks();
                this.showAlert('Tarefa editada com sucesso!', 'success');
            }
        }
    }

    /**
     * Define o filtro atual
     * @param {string} filter - Tipo de filtro (all, pending, completed)
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Atualiza a aparência dos botões de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });
        
        // Marca o botão ativo
        const activeBtn = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-blue-600', 'text-white');
            activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        }
        
        // Re-renderiza a lista com o filtro aplicado
        this.renderTasks();
    }

    /**
     * Filtra as tarefas baseado no filtro atual
     * @returns {Array} Array de tarefas filtradas
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    /**
     * Renderiza a lista de tarefas na tela
     */
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        
        if (!taskList || !emptyState) {
            console.error('Elementos da lista não encontrados');
            return;
        }

        const filteredTasks = this.getFilteredTasks();

        // Limpa a lista atual
        taskList.innerHTML = '';

        // Se não há tarefas, mostra o estado vazio
        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        } else {
            emptyState.classList.add('hidden');
        }

        // Cria o HTML para cada tarefa
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    /**
     * Cria o elemento HTML de uma tarefa
     * @param {Object} task - Objeto da tarefa
     * @returns {HTMLElement} Elemento HTML da tarefa
     */
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 task-item';
        
        // Formata a data de criação
        const createdDate = new Date(task.createdAt).toLocaleDateString('pt-BR');
        
        taskElement.innerHTML = `
            <!-- Checkbox para marcar como concluída -->
            <input 
                type="checkbox" 
                ${task.completed ? 'checked' : ''} 
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 task-checkbox"
                data-task-id="${task.id}"
            >
            
            <!-- Texto da tarefa -->
            <div class="flex-1 task-content">
                <p class="${task.completed ? 'line-through text-gray-500' : 'text-gray-800'} text-sm md:text-base task-text ${task.completed ? 'completed' : ''}">
                    ${this.escapeHtml(task.text)}
                </p>
                <p class="text-xs text-gray-400 mt-1 task-date">
                    Criada em: ${createdDate}
                </p>
            </div>
            
            <!-- Botões de ação -->
            <div class="flex gap-2 task-actions">
                <button 
                    class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 btn-action btn-edit"
                    title="Editar tarefa"
                    data-task-id="${task.id}"
                    data-action="edit"
                >
                    <i class="fas fa-edit"></i>
                </button>
                <button 
                    class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-colors duration-200 btn-action btn-delete"
                    title="Excluir tarefa"
                    data-task-id="${task.id}"
                    data-action="delete"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Adiciona event listeners usando delegação de eventos
        this.setupTaskEventListeners(taskElement);
        
        return taskElement;
    }

    /**
     * Configura event listeners para elementos de tarefa
     * @param {HTMLElement} taskElement - Elemento da tarefa
     */
    setupTaskEventListeners(taskElement) {
        // Event listener para checkbox
        const checkbox = taskElement.querySelector('.task-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                const taskId = parseInt(checkbox.dataset.taskId);
                this.toggleTask(taskId);
            });
        }

        // Event listeners para botões de ação
        const actionButtons = taskElement.querySelectorAll('.btn-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const taskId = parseInt(button.dataset.taskId);
                const action = button.dataset.action;
                
                if (action === 'edit') {
                    this.editTask(taskId);
                } else if (action === 'delete') {
                    this.removeTask(taskId);
                }
            });
        });
    }

    /**
     * Atualiza os contadores nos botões de filtro
     */
    updateCounters() {
        const totalTasks = this.tasks.length;
        const pendingTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;

        // Atualiza os números nos botões
        const countAll = document.getElementById('countAll');
        const countPending = document.getElementById('countPending');
        const countCompleted = document.getElementById('countCompleted');

        if (countAll) countAll.textContent = totalTasks;
        if (countPending) countPending.textContent = pendingTasks;
        if (countCompleted) countCompleted.textContent = completedTasks;
    }

    /**
     * Remove todas as tarefas
     */
    clearAllTasks() {
        if (this.tasks.length === 0) {
            this.showAlert('Não há tarefas para limpar!', 'info');
            return;
        }

        if (confirm('Tem certeza que deseja excluir TODAS as tarefas? Esta ação não pode ser desfeita!')) {
            this.tasks = [];
            this.taskIdCounter = 1;
            this.saveTasks();
            this.renderTasks();
            this.updateCounters();
            this.showAlert('Todas as tarefas foram removidas!', 'success');
        }
    }

    /**
     * Define a data atual no cabeçalho
     */
    setCurrentDate() {
        const currentDateElement = document.getElementById('currentDate');
        
        if (currentDateElement) {
            const currentDate = new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            currentDateElement.textContent = currentDate;
        }
    }

    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {string} unsafe - String não segura
     * @returns {string} String segura
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Exibe uma mensagem de alerta temporária
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo do alerta (success, error, warning, info)
     */
    showAlert(message, type = 'info') {
        // Remove alertas anteriores
        const existingAlerts = document.querySelectorAll('.app-alert');
        existingAlerts.forEach(alert => alert.remove());

        // Cria o elemento de alerta
        const alert = document.createElement('div');
        alert.className = `app-alert fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 transition-all duration-300 transform translate-x-0`;
        
        // Define a cor baseada no tipo
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        alert.classList.add(colors[type] || colors.info);
        alert.textContent = message;

        // Adiciona o alerta ao body
        document.body.appendChild(alert);

        // Remove o alerta após 3 segundos
        setTimeout(() => {
            alert.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }, 3000);
    }

    /**
     * Obtém estatísticas das tarefas
     * @returns {Object} Objeto com estatísticas
     */
    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            pending,
            completionRate
        };
    }

    /**
     * Exporta as tarefas para JSON
     * @returns {string} String JSON com as tarefas
     */
    exportTasks() {
        const data = {
            tasks: this.tasks,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        return JSON.stringify(data, null, 2);
    }

    /**
     * Importa tarefas de um JSON
     * @param {string} jsonString - String JSON com as tarefas
     * @returns {boolean} True se a importação foi bem-sucedida
     */
    importTasks(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.tasks && Array.isArray(data.tasks)) {
                this.tasks = data.tasks;
                this.taskIdCounter = Math.max(...this.tasks.map(t => t.id)) + 1 || 1;
                this.saveTasks();
                this.renderTasks();
                this.updateCounters();
                this.showAlert('Tarefas importadas com sucesso!', 'success');
                return true;
            } else {
                this.showAlert('Formato de arquivo inválido!', 'error');
                return false;
            }
        } catch (error) {
            console.error('Erro ao importar tarefas:', error);
            this.showAlert('Erro ao importar tarefas!', 'error');
            return false;
        }
    }
}

// Instancia a aplicação quando a página carregar
let todoApp;

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// Expõe alguns métodos globalmente para compatibilidade com HTML inline
window.todoApp = {
    toggleTask: (id) => todoApp?.toggleTask(id),
    editTask: (id) => todoApp?.editTask(id),
    removeTask: (id) => todoApp?.removeTask(id)
};