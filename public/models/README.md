# TNS Hero 3D Brain Model Directory

Place the exported Meshy AI anatomical brain binary glTF file here:

```text
public/models/human-brain.glb
```

Reference Meshy AI model:
- URL: https://www.meshy.ai/s/txK6SA
- Model name: `human_brain_anatomical_mod.`

Once `human-brain.glb` is saved in this folder, the React Three Fiber hero scene (`src/components/brain/BrainHeroCanvas.jsx`) automatically detects the binary `.glb` header, loads it via `BrainModelRig.jsx`, preserves its anatomical textures, and animates purple (`#393185`) and gold (`#C18C26`) electrical neural signal pulses across its surface with gentle rotation and mouse-responsive parallax.
