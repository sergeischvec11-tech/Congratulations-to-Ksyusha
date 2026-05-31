using System.Data;
using System.Data.OleDb;

namespace SergeevAccessApp;

public partial class Form1 : Form
{
    private readonly Button _showAllButton = new();
    private readonly Button _showAccessoriesButton = new();
    private readonly DataGridView _grid = new();
    private readonly Label _statusLabel = new();

    public Form1()
    {
        InitializeComponent();
        BuildLayout();
        Load += (_, _) => LoadAllProducts();
    }

    private static string DatabasePath
    {
        get
        {
            var outputPath = Path.Combine(AppContext.BaseDirectory, "Data", "Database21_Normalized.accdb");
            if (File.Exists(outputPath))
            {
                return outputPath;
            }

            var projectPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Data", "Database21_Normalized.accdb");
            return Path.GetFullPath(projectPath);
        }
    }

    private static string ConnectionString =>
        $"Provider=Microsoft.ACE.OLEDB.12.0;Data Source={DatabasePath};Persist Security Info=False;";

    private void BuildLayout()
    {
        Text = "Склад товаров - Сергеев";
        MinimumSize = new Size(980, 620);
        StartPosition = FormStartPosition.CenterScreen;

        var buttonsPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            Height = 58,
            Padding = new Padding(12, 10, 12, 8),
            FlowDirection = FlowDirection.LeftToRight,
            WrapContents = false
        };

        ConfigureButton(_showAllButton, "Все товары", LoadAllProducts);
        ConfigureButton(_showAccessoriesButton, "Аксессуары на складе", LoadAccessories);

        _statusLabel.AutoSize = true;
        _statusLabel.Padding = new Padding(12, 8, 0, 0);
        _statusLabel.Text = "Подключение к базе Access...";

        buttonsPanel.Controls.Add(_showAllButton);
        buttonsPanel.Controls.Add(_showAccessoriesButton);
        buttonsPanel.Controls.Add(_statusLabel);

        _grid.Dock = DockStyle.Fill;
        _grid.AllowUserToAddRows = false;
        _grid.AllowUserToDeleteRows = false;
        _grid.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
        _grid.BackgroundColor = SystemColors.Window;
        _grid.BorderStyle = BorderStyle.None;
        _grid.ReadOnly = true;
        _grid.RowHeadersVisible = false;
        _grid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;

        Controls.Add(_grid);
        Controls.Add(buttonsPanel);
    }

    private static void ConfigureButton(Button button, string text, Action clickAction)
    {
        button.AutoSize = true;
        button.Height = 36;
        button.Margin = new Padding(0, 0, 10, 0);
        button.Padding = new Padding(12, 4, 12, 4);
        button.Text = text;
        button.UseVisualStyleBackColor = true;
        button.Click += (_, _) => clickAction();
    }

    private void LoadAllProducts()
    {
        const string sql = """
            SELECT
                p.Article AS [Артикул],
                c.CategoryName AS [Категория],
                p.ProductName AS [Наименование],
                s.Quantity AS [Количество на складе],
                p.PriceWithVat / 1.2 AS [Цена без НДС]
            FROM (Products AS p
                INNER JOIN Categories AS c ON p.CategoryId = c.CategoryId)
                INNER JOIN Stock AS s ON p.ProductId = s.ProductId
            ORDER BY c.CategoryName, p.ProductName
            """;

        LoadData(sql, "Все товары из нормализованной базы");
    }

    private void LoadAccessories()
    {
        const string sql = """
            SELECT
                p.Article AS [Артикул],
                p.ProductName AS [Наименование],
                s.Quantity AS [Количество на складе],
                p.PriceWithVat / 1.2 AS [Цена без НДС]
            FROM (Products AS p
                INNER JOIN Categories AS c ON p.CategoryId = c.CategoryId)
                INNER JOIN Stock AS s ON p.ProductId = s.ProductId
            WHERE c.CategoryName = ?
            ORDER BY p.ProductName
            """;

        LoadData(sql, "Аксессуары, которые хранятся на складе", new OleDbParameter { Value = "Аксессуары" });
    }

    private void LoadData(string sql, string title, params OleDbParameter[] parameters)
    {
        try
        {
            using var connection = new OleDbConnection(ConnectionString);
            using var command = new OleDbCommand(sql, connection);
            command.Parameters.AddRange(parameters);

            var table = new DataTable();
            using var adapter = new OleDbDataAdapter(command);
            adapter.Fill(table);

            _grid.DataSource = table;
            FormatGrid();
            _statusLabel.Text = $"{title}: {table.Rows.Count} записей";
        }
        catch (Exception ex)
        {
            _statusLabel.Text = "Ошибка подключения к Access";
            MessageBox.Show(
                $"Не удалось загрузить данные из базы Access.\n\n{ex.Message}",
                "Ошибка",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
    }

    private void FormatGrid()
    {
        if (_grid.Columns["Наименование"] is DataGridViewColumn nameColumn)
        {
            nameColumn.FillWeight = 260;
        }

        if (_grid.Columns["Цена без НДС"] is DataGridViewColumn priceColumn)
        {
            priceColumn.DefaultCellStyle.Format = "N2";
            priceColumn.DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
        }

        if (_grid.Columns["Количество на складе"] is DataGridViewColumn quantityColumn)
        {
            quantityColumn.DefaultCellStyle.Format = "N0";
            quantityColumn.DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
        }
    }
}
