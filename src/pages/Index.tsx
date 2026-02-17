import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#36393f] text-white overflow-x-hidden">
      <nav className="bg-[#2f3136] border-b border-[#202225] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#5865f2] rounded-full flex items-center justify-center">
              <Icon name="Phone" size={20} className="text-white hidden sm:block" />
              <Icon name="Phone" size={16} className="text-white sm:hidden" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Коннект</h1>
              <p className="text-xs text-[#b9bbbe] hidden sm:block">Звонки, видео и файлы — всё в одном</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Button variant="ghost" className="text-[#b9bbbe] hover:text-white hover:bg-[#40444b]">
              <Icon name="Info" size={16} className="mr-2" />
              О приложении
            </Button>
            <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded text-sm font-medium">
              Скачать
            </Button>
          </div>
          <Button
            variant="ghost"
            className="sm:hidden text-[#b9bbbe] hover:text-white hover:bg-[#40444b] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <Icon name="X" size={20} /> : <Icon name="Menu" size={20} />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-[#202225]">
            <div className="flex flex-col gap-3">
              <Button variant="ghost" className="text-[#b9bbbe] hover:text-white hover:bg-[#40444b] justify-start">
                <Icon name="Info" size={16} className="mr-2" />
                О приложении
              </Button>
              <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded text-sm font-medium">
                Скачать
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div className="flex min-h-screen">
        <div className="hidden lg:flex w-[72px] bg-[#202225] flex-col items-center py-3 gap-2">
          <div className="w-12 h-12 bg-[#5865f2] rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer">
            <Icon name="Phone" size={24} className="text-white" />
          </div>
          <div className="w-8 h-[2px] bg-[#36393f] rounded-full"></div>
          {[
            { icon: "Video", label: "Видео" },
            { icon: "MessageCircle", label: "Чат" },
            { icon: "FolderOpen", label: "Файлы" },
            { icon: "Users", label: "Контакты" },
          ].map((item, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-[#36393f] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer hover:bg-[#5865f2] group"
              title={item.label}
            >
              <Icon name={item.icon} size={20} className="text-[#dcddde] group-hover:text-white" />
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          <div
            className={`${mobileSidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-60 bg-[#2f3136] flex flex-col`}
          >
            <div className="p-4 border-b border-[#202225] flex items-center justify-between">
              <h2 className="text-white font-semibold text-base">Коннект</h2>
              <Button
                variant="ghost"
                className="lg:hidden text-[#b9bbbe] hover:text-white hover:bg-[#40444b] p-1"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
            <div className="flex-1 p-2">
              <div className="mb-4">
                <div className="flex items-center gap-1 px-2 py-1 text-[#8e9297] text-xs font-semibold uppercase tracking-wide">
                  <Icon name="ArrowRight" size={12} />
                  <span>Чаты</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {["общий", "новости", "витрина", "поддержка"].map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-[#8e9297] hover:text-[#dcddde] hover:bg-[#393c43] cursor-pointer"
                    >
                      <Icon name="Hash" size={16} />
                      <span className="text-sm">{channel}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 px-2 py-1 text-[#8e9297] text-xs font-semibold uppercase tracking-wide">
                  <Icon name="ArrowRight" size={12} />
                  <span>Голосовые комнаты</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {["Переговорная", "Свободный звонок"].map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-[#8e9297] hover:text-[#dcddde] hover:bg-[#393c43] cursor-pointer"
                    >
                      <Icon name="Mic" size={16} />
                      <span className="text-sm">{channel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-2 bg-[#292b2f] flex items-center gap-2">
              <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">А</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">Алексей</div>
                <div className="text-[#b9bbbe] text-xs truncate">В сети</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-[#40444b]">
                  <Icon name="Mic" size={16} className="text-[#b9bbbe]" />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-[#40444b]">
                  <Icon name="Settings" size={16} className="text-[#b9bbbe]" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="h-12 bg-[#36393f] border-b border-[#202225] flex items-center px-4 gap-2">
              <Button
                variant="ghost"
                className="lg:hidden text-[#8e9297] hover:text-[#dcddde] hover:bg-[#40444b] p-1 mr-2"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Icon name="Menu" size={20} />
              </Button>
              <Icon name="Hash" size={20} className="text-[#8e9297]" />
              <span className="text-white font-semibold">витрина</span>
              <div className="w-px h-6 bg-[#40444b] mx-2 hidden sm:block"></div>
              <span className="text-[#8e9297] text-sm hidden sm:block">Общайся без границ с Коннект</span>
              <div className="ml-auto flex items-center gap-2 sm:gap-4">
                <Icon name="Bell" size={20} className="text-[#b9bbbe] cursor-pointer hover:text-[#dcddde] hidden sm:block" />
                <Icon name="Users" size={20} className="text-[#b9bbbe] cursor-pointer hover:text-[#dcddde] hidden sm:block" />
                <Icon name="Search" size={20} className="text-[#b9bbbe] cursor-pointer hover:text-[#dcddde]" />
              </div>
            </div>

            <div className="flex-1 p-2 sm:p-4 space-y-4 sm:space-y-6 overflow-y-auto">
              <div className="flex gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#5865f2] rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Phone" size={20} className="text-white hidden sm:block" />
                  <Icon name="Phone" size={16} className="text-white sm:hidden" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium text-sm sm:text-base">Коннект Бот</span>
                    <span className="bg-[#5865f2] text-white text-xs px-1 rounded">БОТ</span>
                    <span className="text-[#72767d] text-xs hidden sm:inline">Сегодня в 12:00</span>
                  </div>
                  <div className="text-[#dcddde] text-sm sm:text-base">
                    <p className="mb-3 sm:mb-4">
                      <strong>Добро пожаловать в Коннект!</strong> Общайтесь с близкими через видеозвонки, голосовые звонки и обменивайтесь файлами.
                    </p>
                    <div className="bg-[#2f3136] border-l-4 border-[#5865f2] p-3 sm:p-4 rounded">
                      <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Что умеет Коннект:</h3>
                      <ul className="space-y-1 text-xs sm:text-sm text-[#b9bbbe]">
                        <li>HD видеозвонки с кристально чистым звуком</li>
                        <li>Голосовые звонки на любое устройство</li>
                        <li>Передача документов, фото и видео в один клик</li>
                        <li>Групповые звонки до 50 человек</li>
                        <li>Работает на телефоне, планшете и компьютере</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-medium">О</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium text-sm sm:text-base">Ольга</span>
                    <span className="text-[#72767d] text-xs hidden sm:inline">Сегодня в 12:05</span>
                  </div>
                  <div className="text-[#dcddde] mb-3 text-sm sm:text-base">
                    Только что созвонилась с мамой по видео — качество супер! 📹
                  </div>

                  <div className="bg-[#2f3136] border border-[#202225] rounded-lg overflow-hidden w-full max-w-sm">
                    <div className="h-16 sm:h-20 bg-gradient-to-r from-[#5865f2] to-[#7c3aed] relative">
                      <div className="absolute -bottom-3 sm:-bottom-4 left-3 sm:left-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#2f3136] bg-[#36393f] overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2f3136] rounded-full flex items-center justify-center">
                              <span className="text-lg sm:text-2xl">О</span>
                            </div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#3ba55c] border-4 border-[#2f3136] rounded-full"></div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#4f545c] hover:bg-[#5d6269] text-white text-xs px-2 sm:px-3 py-1 rounded"
                      >
                        <Icon name="Settings" size={12} className="mr-1" />
                        <span className="hidden sm:inline">Профиль</span>
                      </Button>
                    </div>

                    <div className="pt-4 sm:pt-6 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-white text-lg sm:text-xl font-bold mb-1">Ольга</h3>
                        <div className="flex items-center gap-2 text-[#b9bbbe] text-xs sm:text-sm">
                          <span>olga_connect</span>
                          <span>-</span>
                          <span>На связи</span>
                          <div className="flex gap-1 ml-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#5865f2] rounded-sm"></div>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#3ba55c] rounded-sm"></div>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#faa61a] rounded-sm"></div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3 sm:mb-4">
                        <div className="bg-[#36393f] rounded-lg p-2 sm:p-3 relative">
                          <div className="absolute -top-2 left-3 sm:left-4 w-4 h-4 bg-[#36393f] rotate-45"></div>
                          <div className="flex items-center gap-2 text-[#dcddde] text-xs sm:text-sm">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#3ba55c] rounded-full flex items-center justify-center">
                              <Icon name="Phone" size={8} className="text-white" />
                            </div>
                            <span>На видеозвонке...</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex border-b border-[#40444b] mb-3 sm:mb-4">
                        <button className="px-3 sm:px-4 py-2 text-[#8e9297] text-xs sm:text-sm font-medium hover:text-[#dcddde]">
                          Обо мне
                        </button>
                        <button className="px-3 sm:px-4 py-2 text-white text-xs sm:text-sm font-medium border-b-2 border-[#5865f2]">
                          Активность
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-[#8e9297] text-xs font-semibold uppercase tracking-wide mb-2 sm:mb-3">
                          <span>Видеозвонок</span>
                        </div>

                        <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#36393f] rounded-lg">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5865f2] to-[#7c3aed] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon name="Video" size={24} className="text-white hidden sm:block" />
                            <Icon name="Video" size={20} className="text-white sm:hidden" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-xs sm:text-sm mb-1">Коннект</div>
                            <div className="text-[#dcddde] text-xs sm:text-sm mb-1">Звонок с мамой</div>
                            <div className="text-[#b9bbbe] text-xs sm:text-sm mb-2">HD Видео</div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#3ba55c] rounded-full animate-pulse"></div>
                              <span className="text-[#3ba55c] text-xs font-medium">12:37 длительность</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-medium">Д</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium text-sm sm:text-base">Дмитрий</span>
                    <span className="text-[#72767d] text-xs hidden sm:inline">Сегодня в 12:08</span>
                  </div>
                  <div className="text-[#dcddde] text-sm sm:text-base">
                    Отправил документы через Коннект за секунду — удобнее, чем почта! 📎
                  </div>
                </div>
              </div>

              <div className="bg-[#2f3136] border border-[#202225] rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icon name="Download" size={24} className="text-[#5865f2] hidden sm:block" />
                  <Icon name="Download" size={20} className="text-[#5865f2] sm:hidden" />
                  Начни общение с Коннект
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#5865f2] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-sm sm:text-base">1</span>
                    </div>
                    <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Скачай приложение</h3>
                    <p className="text-[#b9bbbe] text-xs sm:text-sm">Коннект для iOS, Android, Windows и macOS</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#5865f2] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-sm sm:text-base">2</span>
                    </div>
                    <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Зарегистрируйся</h3>
                    <p className="text-[#b9bbbe] text-xs sm:text-sm">Быстрая регистрация по номеру телефона</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#5865f2] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-sm sm:text-base">3</span>
                    </div>
                    <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Позвони близким</h3>
                    <p className="text-[#b9bbbe] text-xs sm:text-sm">Видео или аудио — выбирай формат общения</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 sm:px-8 py-2 sm:py-3 rounded text-sm font-medium">
                    <Icon name="Download" size={16} className="mr-2" />
                    Скачать Коннект
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#4f545c] text-[#b9bbbe] hover:bg-[#40444b] hover:border-[#6d6f78] px-6 sm:px-8 py-2 sm:py-3 rounded text-sm font-medium bg-transparent"
                  >
                    <Icon name="Globe" size={16} className="mr-2" />
                    Открыть в браузере
                  </Button>
                </div>
              </div>

              <div className="bg-[#2f3136] border border-[#202225] rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Почему Коннект?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    {
                      icon: "Video",
                      title: "HD видеозвонки",
                      desc: "Кристально чёткое изображение и звук",
                    },
                    {
                      icon: "FileText",
                      title: "Обмен файлами",
                      desc: "Документы, фото и видео без ограничений",
                    },
                    {
                      icon: "Shield",
                      title: "Безопасность",
                      desc: "Сквозное шифрование всех звонков и данных",
                    },
                    {
                      icon: "Smartphone",
                      title: "Все платформы",
                      desc: "Телефон, планшет, компьютер — везде на связи",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded hover:bg-[#36393f] transition-colors"
                    >
                      <div className="text-[#5865f2] mt-0.5">
                        <Icon name={feature.icon} size={20} className="hidden sm:block" />
                        <Icon name={feature.icon} size={16} className="sm:hidden" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-xs sm:text-sm">{feature.title}</div>
                        <div className="text-[#b9bbbe] text-xs sm:text-sm">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-2 sm:p-4">
              <div className="bg-[#40444b] rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                <div className="text-[#72767d] text-xs sm:text-sm">Сообщение #витрина</div>
              </div>
            </div>
          </div>

          <div className="hidden xl:block w-60 bg-[#2f3136] p-4">
            <div className="mb-4">
              <h3 className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide mb-2">В сети — 3</h3>
              <div className="space-y-2">
                {[
                  {
                    name: "Ольга",
                    status: "На видеозвонке",
                    avatar: "О",
                    color: "from-purple-500 to-pink-500",
                  },
                  { name: "Дмитрий", status: "Отправляет файлы", avatar: "Д", color: "from-green-500 to-blue-500" },
                  { name: "Алексей", status: "В сети", avatar: "А", color: "from-blue-500 to-purple-500" },
                ].map((user, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-[#36393f] cursor-pointer">
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${user.color} rounded-full flex items-center justify-center relative`}
                    >
                      <span className="text-white text-sm font-medium">{user.avatar}</span>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3ba55c] border-2 border-[#2f3136] rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{user.name}</div>
                      <div className="text-[#b9bbbe] text-xs truncate">{user.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;