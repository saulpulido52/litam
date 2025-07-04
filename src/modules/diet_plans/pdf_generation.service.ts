import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { DietPlan } from '../../database/entities/diet_plan.entity';
import { AppError } from '../../utils/app.error';

interface PdfGenerationResult {
    pdfPath: string;
    filename: string;
}

export class PdfGenerationService {
    private readonly PDF_DIR = path.join(process.cwd(), 'generated-pdfs');
    private readonly BRAND_COLOR = '#1e3a8a';
    private readonly TEXT_COLOR = '#374151';
    private readonly LIGHT_TEXT_COLOR = '#6b7280';

    constructor() {
        if (!fs.existsSync(this.PDF_DIR)) {
            fs.mkdirSync(this.PDF_DIR, { recursive: true });
        }
    }

    public async generate(dietPlan: DietPlan): Promise<PdfGenerationResult> {
        const filename = `plan-nutricional-${dietPlan.id}-${Date.now()}.pdf`;
        const pdfPath = path.join(this.PDF_DIR, filename);

        const doc = new PDFDocument({
            size: 'A4',
            margin: 40,
            info: {
                Title: `Plan Nutricional - ${dietPlan.name}`,
                Author: `NutriWeb - Dr./Dra. ${dietPlan.nutritionist.first_name}`,
                Creator: 'NutriWeb Platform'
            }
        });

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // --- Contenido del PDF ---
        this._addHeader(doc, dietPlan);
        this._addPatientAndPlanInfo(doc, dietPlan);
        this._addWeeklyMealsTable(doc, dietPlan);
        this._addFooter(doc);
        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve({ pdfPath, filename }));
            stream.on('error', (err) => reject(new AppError(`Error al escribir el archivo PDF: ${err.message}`, 500)));
        });
    }

    private _addHeader(doc: any, dietPlan: DietPlan): void {
        doc.fontSize(20).font('Helvetica-Bold').fillColor(this.BRAND_COLOR)
           .text('Plan Nutricional Personalizado', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor(this.TEXT_COLOR)
           .text(`Preparado por: Dr./Dra. ${dietPlan.nutritionist.first_name} ${dietPlan.nutritionist.last_name}`, { align: 'center' });
        doc.moveDown(1.5);
    }

    private _addPatientAndPlanInfo(doc: any, dietPlan: DietPlan): void {
        this._addSectionTitle(doc, 'Información del Paciente y Plan');
        const info = {
            'Paciente': `${dietPlan.patient.first_name} ${dietPlan.patient.last_name}`,
            'Periodo del Plan': `${new Date(dietPlan.start_date).toLocaleDateString()} - ${new Date(dietPlan.end_date).toLocaleDateString()}`,
            'Calorías Diarias (Promedio)': `${dietPlan.daily_calories_target || 'N/A'} kcal`,
            'Objetivo Principal': dietPlan.description || 'No especificado'
        };
        this._addKeyValuePairs(doc, info);
    }

    private _addWeeklyMealsTable(doc: any, dietPlan: DietPlan): void {
        this._addSectionTitle(doc, 'Planificación Semanal de Comidas');
        if (!dietPlan.weekly_plans || dietPlan.weekly_plans.length === 0) {
            doc.fontSize(10).font('Helvetica').text('No hay una planificación semanal detallada en este plan.', { indent: 10 });
            return;
        }
        dietPlan.weekly_plans.forEach((week: any, idx: number) => {
            if (!week.meals || week.meals.length === 0) {
                // No imprimir nada si no hay comidas en la semana
                return;
            }
            doc.fontSize(12).font('Helvetica-Bold').text(`Semana ${week.week_number || week.weekNumber}`, { underline: true, align: 'left' });
            if (week.period_start && week.period_end) {
                doc.fontSize(10).font('Helvetica').text(`Período: ${week.period_start} - ${week.period_end}`, { align: 'left' });
            }
            doc.moveDown(0.5);
            const table = {
                headers: ['Día', 'Tipo', 'Hora', 'Descripción', 'Calorías', 'Prot.', 'Carb.', 'Grasas', 'Notas'],
                widths: [35, 35, 30, 110, 40, 32, 32, 32, 70],
                rows: week.meals.map((meal: any) => [
                    this._capitalize(meal.day),
                    this._getMealTypeLabel(meal.meal_type),
                    meal.time || '',
                    meal.meal_description || '',
                    meal.total_calories ? `${meal.total_calories}` : '',
                    meal.total_protein ? `${meal.total_protein}` : '',
                    meal.total_carbs ? `${meal.total_carbs}` : '',
                    meal.total_fats ? `${meal.total_fats}` : '',
                    meal.notes || ''
                ])
            };
            this._createTable(doc, table);
            doc.moveDown(1);
        });
    }

    private _addFooter(doc: any): void {
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor(this.LIGHT_TEXT_COLOR)
               .text(`Página ${i + 1} de ${pageCount} | Generado por NutriWeb`, 50, doc.page.height - 30, {
                   align: 'center',
                   lineBreak: false
               });
        }
    }

    private _addSectionTitle(doc: any, title: string): void {
        doc.fontSize(14).font('Helvetica-Bold').fillColor(this.BRAND_COLOR)
           .text(title);
        doc.strokeColor(this.BRAND_COLOR).lineWidth(0.5)
           .moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
        doc.moveDown(1);
    }

    private _addKeyValuePairs(doc: any, data: Record<string, string>): void {
        doc.fontSize(10);
        for (const [key, value] of Object.entries(data)) {
            doc.font('Helvetica-Bold').text(`${key}: `, { continued: true })
               .font('Helvetica').text(value);
        }
        doc.moveDown(1);
    }

    private _createTable(doc: any, table: { headers: string[], rows: string[][], widths: number[] }): void {
        if (!table.rows || table.rows.length === 0) return; // No imprimir tabla vacía
        let y = doc.y;
        const startX = doc.page.margins.left;
        // Headers
        doc.font('Helvetica-Bold');
        table.headers.forEach((header, i) => {
            doc.text(header, startX + table.widths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: table.widths[i], align: 'left' });
        });
        y += 18;
        // Rows
        doc.font('Helvetica');
        table.rows.forEach(row => {
            const rowHeight = Math.max(...row.map((cell, i) => doc.heightOfString(cell, { width: table.widths[i] })));
            // Salto de página si no cabe la fila
            if (y + rowHeight + 20 > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                y = doc.y;
                // Redibujar headers
                doc.font('Helvetica-Bold');
                table.headers.forEach((header, i) => {
                    doc.text(header, startX + table.widths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: table.widths[i], align: 'left' });
                });
                y += 18;
                doc.font('Helvetica');
            }
            row.forEach((cell, i) => {
                doc.text(cell, startX + table.widths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: table.widths[i], align: 'left' });
            });
            y += rowHeight + 8;
        });
        doc.y = y;
    }

    private _getMealTypeLabel(type: string) {
        return ({ breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena', snack: 'Colación' }[type] || this._capitalize(type));
    }
    private _capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
} 