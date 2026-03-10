import mongoose from 'mongoose'

const { Schema, model } = mongoose

const systemSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

systemSettingSchema.index({ key: 1 }, { unique: true })

/**
 * @typedef {import('mongoose').InferSchemaType<typeof systemSettingSchema>} SystemSetting
 */

const SystemSetting = model('SystemSetting', systemSettingSchema)

export default SystemSetting
export { systemSettingSchema }
