import re

with open('index.html', 'r') as f:
    html = f.read()

html = html.replace('<a href="https://naroa.online" target="_blank" rel="noopener" class="secret-egg" aria-label="Naroa Online" title="Secret Egg">🥚</a>',
                    '<a href="https://naroa.online" target="_blank" rel="noopener" class="secret-egg" aria-label="Naroa Online" title="Secret Egg">\n      <div class="fried-egg">\n        <div class="yolk"></div>\n      </div>\n    </a>')

with open('index.html', 'w') as f:
    f.write(html)

with open('style.css', 'r') as f:
    css = f.read()

css = re.sub(
    r'\.chatquito-input input \{[\s\S]*?\}',
    '.chatquito-input input {\n  width: 100%;\n  padding: 0.7rem 1rem 0.7rem 1.5rem;\n  background: linear-gradient(100deg, #f0f0f0 0%, #d4b58e 60%, #5c2c16 90%, #ff3300 100%);\n  border: none;\n  color: #000;\n  font-weight: 700;\n  border-radius: 5px 30px 30px 5px;\n  box-shadow: 0 0 15px rgba(255, 51, 0, 0.3), inset -3px 0 5px rgba(255,255,255,0.4);\n  transition: all 0.3s var(--spring-snappy);\n}\n.chatquito-input input::placeholder {\n  color: rgba(0,0,0,0.5);\n}',
    css
)

css = re.sub(
    r'\.chatquito-input input:focus \{[\s\S]*?\}',
    '.chatquito-input input:focus {\n  outline: none;\n  box-shadow: 0 0 25px rgba(255, 51, 0, 0.9), inset -3px 0 5px rgba(255,255,255,0.4);\n  transform: scale(1.02);\n  animation: porro-burn 0.5s infinite alternate;\n}\n\n@keyframes porro-burn {\n  0% { box-shadow: 0 0 15px rgba(255, 51, 0, 0.7), inset -3px 0 5px rgba(255,255,255,0.4); }\n  100% { box-shadow: 0 0 30px rgba(255, 80, 0, 1), inset -3px 0 5px rgba(255,255,255,0.4); }\n}',
    css
)

css += '''
/* SECRET EGG */
.secret-egg {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: inline-block;
  cursor: pointer;
  text-decoration: none;
  margin-top: -15px;
}
.fried-egg {
  width: 50px;
  height: 40px;
  background: #fff;
  border-radius: 50% 60% 40% 70% / 60% 50% 70% 40%;
  position: relative;
  box-shadow: 2px 2px 6px rgba(0,0,0,0.5), inset -2px -2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s var(--spring-snappy);
}
.fried-egg:hover {
  transform: scale(1.2) rotate(15deg);
  filter: drop-shadow(0 0 10px rgba(204,255,0,0.6));
}
.fried-egg .yolk {
  width: 20px;
  height: 20px;
  background: radial-gradient(circle at 30% 30%, #ffdf00, #ff8800);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-60%, -40%);
  box-shadow: inset -2px -2px 5px rgba(0,0,0,0.2), 2px 2px 4px rgba(0,0,0,0.3);
}
'''

with open('style.css', 'w') as f:
    f.write(css)
