import Joi from "joi"

export const createTaskSchema = Joi.object({
    title: Joi.string().required().max(100).messages({
        'string.empty': 'Title is required!',
        'string.max': 'Title must be less than 100 characters!'
    }),
    description: Joi.string().optional(),
    due_date: Joi.date().optional().messages({
        'date.base': 'Due date must be a valid date!',
    })
})

export const updateTaskStatusSchema = Joi.object({
    status: Joi.string().valid("pending", "in-progress", "completed").optional().messages({
        'any.only': 'Status must be either pending, in-progress or completed!'
    }),
    title: Joi.string().optional().max(100).messages({
        'string.max': 'Title must be less than 100 characters!'
    }),
    description: Joi.string().optional(),
    due_date: Joi.date().optional().messages({
        'date.base': 'Due date must be a valid date!',
    })
});